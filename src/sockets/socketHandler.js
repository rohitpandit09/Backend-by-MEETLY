const Class = require("../models/Class");

const onlineUsers = {}; // { classId: [users] }
const livePolls = {}; // { classId: [polls] }
const pollTimers = {}; // { classId: { pollId: timeoutId } }
const liveTests = {}; // { classId: [tests] }

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected", socket.id);

    socket.on("join_class", async ({ classId, user }) => {
      if (!classId || !user) return;

      try {
        const foundClass = await Class.findById(classId);
        if (!foundClass) return;

        socket.join(classId);

        if (!onlineUsers[classId]) {
          onlineUsers[classId] = [];
        }

        const exists = onlineUsers[classId].some((u) => u.socketId === socket.id);

        if (!exists) {
          onlineUsers[classId].push({
            id: user.id,
            name: user.name,
            role: user.role,
            socketId: socket.id
          });
        }

        io.to(classId).emit("online_users", onlineUsers[classId]);
        socket.to(classId).emit("user_joined", { id: user.id, name: user.name, role: user.role, socketId: socket.id });
        const existingPolls = livePolls[classId] || [];
        socket.emit("existing_polls", existingPolls);
        const existingTests = liveTests[classId] || [];
        socket.emit("existing_tests", existingTests);
        const existingMessages = foundClass.messages || [];
        socket.emit("existing_messages", existingMessages);
      } catch (err) {
        console.log("join_class error", err);
      }
    });

    socket.on("send_message", async (msg) => {
      try {
        const foundClass = await Class.findById(msg.classId);
        if (!foundClass) return;

        foundClass.messages.push(msg);
        await foundClass.save();

        socket.to(msg.classId).emit("receive_message", msg);
      } catch (err) {
        console.log("send_message error", err);
      }
    });

    socket.on("start_meeting", async ({ classId }) => {
      try {
        const foundClass = await Class.findById(classId);
        if (!foundClass) return;

        foundClass.isMeetingStarted = true;
        await foundClass.save();

        io.to(classId).emit("meeting_started");
      } catch (err) {
        console.log("start_meeting error", err);
      }
    });

    const closePoll = (classId, pollId) => {
      if (!livePolls[classId]) return;
      const pollIndex = livePolls[classId].findIndex((poll) => poll.id === pollId);
      if (pollIndex === -1) return;
      const poll = livePolls[classId][pollIndex];
      poll.status = "closed";
      io.to(classId).emit("poll_vote_updated", {
        pollId,
        optionVotes: poll.options.map((option) => option.votes),
        totalVotes: poll.totalVotes,
        closed: true
      });
      if (pollTimers[classId] && pollTimers[classId][pollId]) {
        clearTimeout(pollTimers[classId][pollId]);
        delete pollTimers[classId][pollId];
      }
    };

    socket.on("create_poll", ({ classId, poll }) => {
      if (!classId || !poll) return;
      if (!livePolls[classId]) {
        livePolls[classId] = [];
      }
      livePolls[classId].unshift(poll);
      io.to(classId).emit("poll_created", poll);

      if (!pollTimers[classId]) {
        pollTimers[classId] = {};
      }
      if (poll.duration > 0) {
        pollTimers[classId][poll.id] = setTimeout(() => {
          closePoll(classId, poll.id);
        }, poll.duration * 1000);
      }
    });

    socket.on("submit_poll_vote", ({ classId, pollId, optionIndex, user }) => {
      if (!classId || !pollId || optionIndex == null || !user) return;
      const classPolls = livePolls[classId] || [];
      const poll = classPolls.find((item) => item.id === pollId);
      if (!poll || poll.status === "closed") return;

      const previousVote = poll.votes?.[user.id];
      if (!poll.votes) poll.votes = {};
      poll.votes[user.id] = optionIndex;

      if (previousVote != null && previousVote !== optionIndex) {
        poll.options[previousVote].votes = Math.max(0, poll.options[previousVote].votes - 1);
      }

      if (poll.options[optionIndex]) {
        poll.options[optionIndex].votes = (poll.options[optionIndex].votes || 0) + 1;
      }

      if (previousVote == null) {
        poll.totalVotes = (poll.totalVotes || 0) + 1;
      }

      io.to(classId).emit("poll_vote_updated", {
        pollId,
        optionVotes: poll.options.map((option) => option.votes),
        totalVotes: poll.totalVotes,
        closed: false
      });
    });

    socket.on("create_test", ({ classId, test }) => {
      if (!classId || !test) return;
      if (!liveTests[classId]) {
        liveTests[classId] = [];
      }
      liveTests[classId].unshift(test);
      io.to(classId).emit("test_created", test);
    });

    socket.on("submit_test", ({ classId, submission }) => {
      if (!classId || !submission) return;
      const classTests = liveTests[classId] || [];
      const test = classTests.find((item) => item.id === submission.testId);
      if (!test) return;

      if (!test.submissions) test.submissions = {};
      test.submissions[submission.userId] = submission;

      io.to(classId).emit("test_submitted", {
        testId: submission.testId,
        submission
      });
    });

    socket.on("create_assignment", async ({ classId, assignment }) => {
      try {
        const foundClass = await Class.findById(classId);
        if (!foundClass) return;

        const submissions = (foundClass.students || []).map((s) => ({
          studentId: s.studentId,
          studentName: s.studentName,
          submitted: false,
          time: "",
          fileName: "",
          late: false
        }));

        const newAssignment = {
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          submissions
        };

        foundClass.assignments.push(newAssignment);
        await foundClass.save();

        const createdAssignment = foundClass.assignments[foundClass.assignments.length - 1];
        io.to(classId).emit("assignment_created", createdAssignment);
      } catch (err) {
        console.log("create_assignment error", err);
      }
    });

    socket.on("submit_assignment", async ({ classId, assignmentId, submission }) => {
      try {
        const foundClass = await Class.findById(classId);
        if (!foundClass) return;

        const assignment = foundClass.assignments.id(assignmentId);
        if (!assignment) return;

        const existing = assignment.submissions.find(
          (s) => s.studentId === submission.studentId
        );

        if (!existing) return;

        existing.submitted = true;
        existing.fileName = submission.fileName;
        existing.time = new Date().toLocaleTimeString();
        existing.late = new Date() > new Date(assignment.dueDate);

        if (!foundClass.memberSubmissions) {
          foundClass.memberSubmissions = {};
        }

        foundClass.memberSubmissions[submission.studentId] =
          (foundClass.memberSubmissions[submission.studentId] || 0) + 1;

        await foundClass.save();

        io.to(classId).emit("assignment_submitted", {
          assignmentId: assignment._id.toString(),
          submission: existing
        });

        io.to(classId).emit("members_updated", {
          memberSubmissions: foundClass.memberSubmissions
        });
      } catch (err) {
        console.log("submit_assignment error", err);
      }
    });

    socket.on("disconnect", () => {
      Object.keys(onlineUsers).forEach((classId) => {
        onlineUsers[classId] = onlineUsers[classId].filter(
          (u) => u.socketId !== socket.id
        );

        io.to(classId).emit("online_users", onlineUsers[classId]);
      });
    });

    socket.on("send_offer", ({ offer, to, user }) => {
      socket.to(to).emit("receive_offer", {
        offer,
        from: socket.id,
        user
      });
    });

    socket.on("send_answer", ({ answer, to, user }) => {
      socket.to(to).emit("receive_answer", {
        answer,
        from: socket.id,
        user
      });
    });

    socket.on("ice_candidate", ({ candidate, to }) => {
      if (!to || !candidate) return;
      socket.to(to).emit("ice_candidate", {
        candidate,
        from: socket.id
      });
    });
  });
};

module.exports = socketHandler;