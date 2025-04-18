export const GROUP_CHATS = [
  {
    id: "1",
    name: "Project Alpha Team",
    avatar: null,
    initial: "A",
    color: "#F0D3F7",
    description:
      "Team working on Project Alpha - a voice messaging application",
    createdAt: "January 15, 2025",
    members: [
      {
        id: "user1",
        name: "Hossein Azarbad",
        isAdmin: true,
        color: "#F0D3F7",
        initial: "H",
        status: "Online",
      },
      {
        id: "user2",
        name: "Marvin McKinney",
        isAdmin: false,
        color: "#EEEEEE",
        initial: "M",
        status: "Online",
      },
      {
        id: "user3",
        name: "Sarah Johnson",
        isAdmin: false,
        color: "#E3F5FF",
        initial: "S",
        status: "Last seen 2h ago",
      },
      {
        id: "user4",
        name: "Alex Chen",
        isAdmin: false,
        color: "#FFE8CC",
        initial: "A",
        status: "Last seen 1d ago",
      },
    ],
    memberCount: 12,
    lastMessage: {
      type: "voice",
      sender: "Hossein Azarbad",
      duration: "0:19",
      timestamp: "10:37 AM",
    },
    unread: true,
    messageCount: 7,
    messages: [
      {
        id: "1a",
        type: "voice",
        duration: "0:15",
        isSent: false,
        timestamp: "10:30 AM",
        isPlaying: false,
        sender: { id: "user1", name: "Hossein Azarbad" },
      },
      {
        id: "1b",
        type: "voice",
        duration: "0:23",
        isSent: true,
        timestamp: "10:31 AM",
        isPlaying: false,
        sender: { id: "currentUser", name: "You" },
      },
      {
        id: "1c",
        type: "voice",
        duration: "0:12",
        isSent: false,
        timestamp: "10:32 AM",
        isPlaying: false,
        sender: { id: "user2", name: "Marvin McKinney" },
      },
      {
        id: "1d",
        type: "voice",
        duration: "0:42",
        isSent: false,
        timestamp: "10:33 AM",
        isPlaying: false,
        sender: { id: "user3", name: "Sarah Johnson" },
      },
      {
        id: "1e",
        type: "voice",
        duration: "0:28",
        isSent: true,
        timestamp: "10:35 AM",
        isPlaying: false,
        sender: { id: "currentUser", name: "You" },
      },
      {
        id: "1f",
        type: "voice",
        duration: "0:19",
        isSent: false,
        timestamp: "10:37 AM",
        isPlaying: false,
        sender: { id: "user1", name: "Hossein Azarbad" },
      },
      {
        id: "1g",
        type: "voice",
        duration: "0:34",
        isSent: true,
        timestamp: "10:39 AM",
        isPlaying: false,
        sender: { id: "currentUser", name: "You" },
      },
    ],
  },
];
// {
//   id: "2",
//   name: "Weekend Hangout",
//   avatar: null,
//   initial: "W",
//   color: "#EEEEEE",
//   description: "Planning weekend activities and hangouts",
//   createdAt: "February 28, 2025",
//   members: [
//     {
//       id: "user2",
//       name: "Marvin McKinney",
//       isAdmin: true,
//       color: "#EEEEEE",
//       initial: "M",
//       status: "Online",
//     },
//     {
//       id: "user3",
//       name: "Sarah Johnson",
//       isAdmin: false,
//       color: "#E3F5FF",
//       initial: "S",
//       status: "Last seen 2h ago",
//     },
//     {
//       id: "user5",
//       name: "Emily Rodriguez",
//       isAdmin: false,
//       color: "#E0FFE0",
//       initial: "E",
//       status: "Online",
//     },
//   ],
//   memberCount: 5,
//   lastMessage: {
//     type: "voice",
//     sender: "Sarah Johnson",
//     duration: "0:31",
//     timestamp: "9:18 AM",
//   },
//   unread: false,
//   messageCount: 3,
//   messages: [
//     {
//       id: "2a",
//       type: "voice",
//       duration: "0:08",
//       isSent: false,
//       timestamp: "9:15 AM",
//       isPlaying: false,
//       sender: { id: "user2", name: "Marvin McKinney" },
//     },
//     {
//       id: "2b",
//       type: "voice",
//       duration: "0:19",
//       isSent: true,
//       timestamp: "9:16 AM",
//       isPlaying: false,
//       sender: { id: "currentUser", name: "You" },
//     },
//     {
//       id: "2c",
//       type: "voice",
//       duration: "0:31",
//       isSent: false,
//       timestamp: "9:18 AM",
//       isPlaying: false,
//       sender: { id: "user3", name: "Sarah Johnson" },
//     },
//   ],
// },
// {
//   id: "3",
//   name: "UX/UI Design Team",
//   avatar: null,
//   initial: "U",
//   color: "#E3F5FF",
//   description: "Collaborating on UX/UI design projects and feedback",
//   createdAt: "March 5, 2025",
//   members: [
//     {
//       id: "user3",
//       name: "Sarah Johnson",
//       isAdmin: true,
//       color: "#E3F5FF",
//       initial: "S",
//       status: "Last seen 2h ago",
//     },
//     {
//       id: "user4",
//       name: "Alex Chen",
//       isAdmin: true,
//       color: "#FFE8CC",
//       initial: "A",
//       status: "Last seen 1d ago",
//     },
//     {
//       id: "user6",
//       name: "David Kim",
//       isAdmin: false,
//       color: "#D3E5FF",
//       initial: "D",
//       status: "Last seen just now",
//     },
//   ],
//   memberCount: 8,
//   lastMessage: {
//     type: "voice",
//     sender: "Sarah Johnson",
//     duration: "0:45",
//     timestamp: "Yesterday",
//   },
//   unread: true,
//   messageCount: 2,
//   messages: [
//     {
//       id: "3a",
//       type: "voice",
//       duration: "0:45",
//       isSent: false,
//       timestamp: "Yesterday",
//       isPlaying: false,
//       sender: { id: "user3", name: "Sarah Johnson" },
//     },
//     {
//       id: "3b",
//       type: "voice",
//       duration: "0:12",
//       isSent: true,
//       timestamp: "Yesterday",
//       isPlaying: false,
//       sender: { id: "currentUser", name: "You" },
//     },
//   ],
// },
// {
//   id: "4",
//   name: "Marketing Strategy",
//   avatar: null,
//   initial: "M",
//   color: "#FFE8CC",
//   description: "Developing marketing strategies and campaigns",
//   createdAt: "March 20, 2025",
//   members: [
//     {
//       id: "user4",
//       name: "Alex Chen",
//       isAdmin: true,
//       color: "#FFE8CC",
//       initial: "A",
//       status: "Last seen 1d ago",
//     },
//     {
//       id: "user5",
//       name: "Emily Rodriguez",
//       isAdmin: false,
//       color: "#E0FFE0",
//       initial: "E",
//       status: "Online",
//     },
//     {
//       id: "user1",
//       name: "Hossein Azarbad",
//       isAdmin: false,
//       color: "#F0D3F7",
//       initial: "H",
//       status: "Online",
//     },
//   ],
//   memberCount: 7,
//   lastMessage: {
//     type: "voice",
//     sender: "Alex Chen",
//     duration: "0:55",
//     timestamp: "Monday",
//   },
//   unread: false,
//   messageCount: 3,
//   messages: [
//     {
//       id: "4a",
//       type: "voice",
//       duration: "0:55",
//       isSent: false,
//       timestamp: "Monday",
//       isPlaying: false,
//       sender: { id: "user4", name: "Alex Chen" },
//     },
//     {
//       id: "4b",
//       type: "voice",
//       duration: "0:22",
//       isSent: true,
//       timestamp: "Monday",
//       isPlaying: false,
//       sender: { id: "currentUser", name: "You" },
//     },
//     {
//       id: "4c",
//       type: "voice",
//       duration: "0:18",
//       isSent: false,
//       timestamp: "Monday",
//       isPlaying: false,
//       sender: { id: "user5", name: "Emily Rodriguez" },
//     },
//   ],
// },
// {
//   id: "5",
//   name: "Friday Game Night",
//   avatar: null,
//   initial: "F",
//   color: "#E0FFE0",
//   description: "Planning weekly game nights and activities",
//   createdAt: "April 10, 2025",
//   members: [
//     {
//       id: "user5",
//       name: "Emily Rodriguez",
//       isAdmin: true,
//       color: "#E0FFE0",
//       initial: "E",
//       status: "Online",
//     },
//     {
//       id: "user1",
//       name: "Hossein Azarbad",
//       isAdmin: false,
//       color: "#F0D3F7",
//       initial: "H",
//       status: "Online",
//     },
//     {
//       id: "user6",
//       name: "David Kim",
//       isAdmin: false,
//       color: "#D3E5FF",
//       initial: "D",
//       status: "Last seen just now",
//     },
//   ],
//   memberCount: 10,
//   lastMessage: {
//     type: "voice",
//     sender: "Emily Rodriguez",
//     duration: "1:12",
//     timestamp: "8:52 AM",
//   },
//   unread: true,
//   messageCount: 5,
//   messages: [
//     {
//       id: "5a",
//       type: "voice",
//       duration: "0:50",
//       isSent: false,
//       timestamp: "Last week",
//       isPlaying: false,
//       sender: { id: "user5", name: "Emily Rodriguez" },
//     },
//     {
//       id: "5b",
//       type: "voice",
//       duration: "0:15",
//       isSent: true,
//       timestamp: "Last week",
//       isPlaying: false,
//       sender: { id: "currentUser", name: "You" },
//     },
//     {
//       id: "5c",
//       type: "voice",
//       duration: "1:12",
//       isSent: false,
//       timestamp: "8:52 AM",
//       isPlaying: false,
//       sender: { id: "user5", name: "Emily Rodriguez" },
//     },
//   ],
// },
// {
//   id: "6",
//   name: "Book Club",
//   avatar: null,
//   initial: "B",
//   color: "#D3E5FF",
//   description: "Discussing our favorite books and authors",
//   createdAt: "April 5, 2025",
//   members: [
//     {
//       id: "user6",
//       name: "David Kim",
//       isAdmin: true,
//       color: "#D3E5FF",
//       initial: "D",
//       status: "Last seen just now",
//     },
//     {
//       id: "user3",
//       name: "Sarah Johnson",
//       isAdmin: false,
//       color: "#E3F5FF",
//       initial: "S",
//       status: "Last seen 2h ago",
//     },
//     {
//       id: "user2",
//       name: "Marvin McKinney",
//       isAdmin: false,
//       color: "#EEEEEE",
//       initial: "M",
//       status: "Online",
//     },
//   ],
//   memberCount: 6,
//   lastMessage: {
//     type: "voice",
//     sender: "David Kim",
//     duration: "0:33",
//     timestamp: "11:15 AM",
//   },
//   unread: false,
//   messageCount: 4,
//   messages: [
//     {
//       id: "6a",
//       type: "voice",
//       duration: "0:35",
//       isSent: false,
//       timestamp: "Last month",
//       isPlaying: false,
//       sender: { id: "user6", name: "David Kim" },
//     },
//     {
//       id: "6b",
//       type: "voice",
//       duration: "0:22",
//       isSent: true,
//       timestamp: "Last month",
//       isPlaying: false,
//       sender: { id: "currentUser", name: "You" },
//     },
//     {
//       id: "6c",
//       type: "voice",
//       duration: "0:33",
//       isSent: false,
//       timestamp: "11:15 AM",
//       isPlaying: false,
//       sender: { id: "user6", name: "David Kim" },
//     },
//   ],
// },
// {
//   id: "7",
//   name: "Travel Buddies",
//   avatar: null,
//   initial: "T",
//   color: "#FFF3E0",
//   description: "Planning our next travel adventure together",
//   createdAt: "May 15, 2025",
//   members: [
//     {
//       id: "user1",
//       name: "Hossein Azarbad",
//       isAdmin: true,
//       color: "#F0D3F7",
//       initial: "H",
//       status: "Online",
//     },
//     {
//       id: "user4",
//       name: "Alex Chen",
//       isAdmin: false,
//       color: "#FFE8CC",
//       initial: "A",
//       status: "Last seen 1d ago",
//     },
//     {
//       id: "user6",
//       name: "David Kim",
//       isAdmin: false,
//       color: "#D3E5FF",
//       initial: "D",
//       status: "Last seen just now",
//     },
//   ],
//   memberCount: 10,
//   lastMessage: {
//     type: "voice",
//     sender: "Hossein Azarbad",
//     duration: "0:45",
//     timestamp: "3 days ago",
//   },
//   unread: true,
//   messageCount: 8,
//   messages: [
//     {
//       id: "7a",
//       type: "voice",
//       duration: "0:32",
//       isSent: false,
//       timestamp: "3 days ago",
//       isPlaying: false,
//       sender: { id: "user4", name: "Alex Chen" },
//     },
//     {
//       id: "7b",
//       type: "voice",
//       duration: "0:45",
//       isSent: false,
//       timestamp: "3 days ago",
//       isPlaying: false,
//       sender: { id: "user1", name: "Hossein Azarbad" },
//     },
//     {
//       id: "7c",
//       type: "voice",
//       duration: "0:18",
//       isSent: true,
//       timestamp: "3 days ago",
//       isPlaying: false,
//       sender: { id: "currentUser", name: "You" },
//     },
//   ],
// },
// {
//   id: "8",
//   name: "Cooking Club",
//   avatar: null,
//   initial: "C",
//   color: "#FFEBEE",
//   description: "Sharing recipes and cooking tips",
//   createdAt: "June 20, 2025",
//   members: [
//     {
//       id: "user2",
//       name: "Marvin McKinney",
//       isAdmin: true,
//       color: "#EEEEEE",
//       initial: "M",
//       status: "Online",
//     },
//     {
//       id: "user3",
//       name: "Sarah Johnson",
//       isAdmin: false,
//       color: "#E3F5FF",
//       initial: "S",
//       status: "Last seen 2h ago",
//     },
//     {
//       id: "user5",
//       name: "Emily Rodriguez",
//       isAdmin: false,
//       color: "#E0FFE0",
//       initial: "E",
//       status: "Online",
//     },
//   ],
//   memberCount: 7,
//   lastMessage: {
//     type: "voice",
//     sender: "Emily Rodriguez",
//     duration: "0:25",
//     timestamp: "5:30 PM",
//   },
//   unread: false,
//   messageCount: 6,
//   messages: [
//     {
//       id: "8a",
//       type: "voice",
//       duration: "0:14",
//       isSent: false,
//       timestamp: "5:20 PM",
//       isPlaying: false,
//       sender: { id: "user2", name: "Marvin McKinney" },
//     },
//     {
//       id: "8b",
//       type: "voice",
//       duration: "0:25",
//       isSent: false,
//       timestamp: "5:30 PM",
//       isPlaying: false,
//       sender: { id: "user5", name: "Emily Rodriguez" },
//     },
//     {
//       id: "8c",
//       type: "voice",
//       duration: "0:10",
//       isSent: true,
//       timestamp: "5:35 PM",
//       isPlaying: false,
//       sender: { id: "currentUser", name: "You" },
//     },
//   ],
// },
export const AUDIO_COMMENTS = [
  {
    id: "1",
    username: "Abil wardani",
    avatar:
      "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
    time: "03:45PM",
    audioDuration: "01:11",
    replyCount: "3k",
    likes: "1.3k",
    replies: [
      {
        id: "1-1",
        username: "Abil wardani",
        avatar:
          "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
        time: "03:45PM",
        audioDuration: "01:11",
        replyCount: "3k",
        likes: "1.3k",
      },
      {
        id: "1-2",
        username: "Abil wardani",
        avatar:
          "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
        time: "03:45PM",
        audioDuration: "01:11",
        replyCount: "3k",
        likes: "1.3k",
      },
    ],
  },
  {
    id: "2",
    username: "Abil wardani",
    avatar:
      "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
    time: "03:45PM",
    audioDuration: "01:11",
    replyCount: "3k",
    likes: "1.3k",
    replies: [],
  },
  {
    id: "3",
    username: "Abil wardani",
    avatar:
      "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
    time: "03:45PM",
    audioDuration: "01:11",
    replyCount: "3k",
    likes: "1.3k",
    replies: [],
  },
];
export const postData = [
  {
    id: "1",
    avatar:
      "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
    username: "Jaydeep Sharma",
    timeAgo: "2 minutes",
    caption:
      "I was working on my bike and one of the part randomly fell, can you suggest me the reason?",
    imageUrl:
      "https://images.unsplash.com/photo-1741567348603-0bef4612bea2?q=80&w=2138&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    likes: "50k",
    shares: "24k",
    commentCount: 24,
  },
  {
    id: "2",
    avatar:
      "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
    username: "Jaydeep Sharma",
    timeAgo: "15 minutes",
    caption:
      "Just finished assembling my new road bike. Any tips for a first-time rider?",
    imageUrl:
      "https://images.unsplash.com/photo-1741866987680-5e3d7f052b87?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDZ8Ym84alFLVGFFMFl8fGVufDB8fHx8fA%3D%3D",
    likes: "32k",
    shares: "18k",
    commentCount: 15,
  },
];

export const savedData = [
  {
    id: "1",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNV2dimRVLDjbd9FtA7z4Qz8wJIVQ_UljnUiB6Zd-5TCWz8-5TFzTZf90&s",
    username: "Jane Cooper",
    timeAgo: "15 minutes",
    caption:
      "Just finished assembling my new road bike. Any tips for a first-time rider?",
    imageUrl: "https://via.placeholder.com/400x300",
    likes: "32k",
    shares: "18k",
    commentCount: 15,
  },
  {
    id: "2",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIC58Nd1zNJDZBd_wdQZ3gOUTQLrdSbmlzxv6oelm8bMqr4O_sfTcnBIY&s",
    username: "Ralph Edwards",
    timeAgo: "2 minutes",
    caption:
      "I was working on my bike and one of the part randomly fell, can you suggest me the reason?",
    imageUrl: "https://via.placeholder.com/400x300",
    likes: "50k",
    shares: "24k",
    commentCount: 24,
  },
];

export const NOTIFICATIONS = [
  {
    title: "Today",
    data: [
      {
        id: "1",
        user: {
          name: "Oban robert",
          avatar: null,
          initial: "O",
        },
        message: "respond to your story",
        timestamp: "1 min ago",
        unread: false,
      },
      {
        id: "2",
        user: {
          name: "Natalia",
          avatar: null,
          initial: "N",
        },
        message: "Like your story",
        timestamp: "20 min ago",
        unread: true,
      },
      {
        id: "3",
        user: {
          name: "Roben",
          avatar: null,
          initial: "R",
        },
        message: "Started follow you",
        timestamp: "45 min ago",
        unread: false,
      },
    ],
  },
  {
    title: "Yesterday",
    data: [
      {
        id: "4",
        user: {
          name: "Anggi",
          avatar: null,
          initial: "A",
        },
        message: "Started followed you",
        timestamp: "1 day ago",
        unread: false,
      },
      {
        id: "5",
        user: {
          name: "Pedro",
          avatar: null,
          initial: "P",
        },
        message: "Like your story",
        timestamp: "1day ago",
        unread: false,
      },
      {
        id: "6",
        user: {
          name: "Mia",
          avatar: null,
          initial: "M",
        },
        message: "Respond your story",
        timestamp: "1 day ago",
        unread: false,
      },
    ],
  },
  {
    title: "This week",
    data: [
      {
        id: "7",
        user: {
          name: "Ermi",
          avatar: null,
          initial: "E",
        },
        message: "Like your story",
        timestamp: "1 week ago",
        unread: false,
      },
    ],
  },
];

export const SAMPLE_CONVERSATIONS = [
  {
    id: "1",
    user: {
      name: "Hossein Azarbad",
      avatar: null,
      initial: "H",
      color: "#F0D3F7",
      hasStory: true,
      status: "Online",
    },
    messages: [
      {
        id: "1a",
        type: "voice",
        duration: "0:15",
        isSent: false,
        timestamp: "10:30 AM",
        isPlaying: false,
      },
      {
        id: "1b",
        type: "voice",
        duration: "0:23",
        isSent: true,
        timestamp: "10:31 AM",
        isPlaying: false,
      },
      {
        id: "1c",
        type: "voice",
        duration: "0:12",
        isSent: false,
        timestamp: "10:32 AM",
        isPlaying: false,
      },
      {
        id: "1d",
        type: "voice",
        duration: "0:42",
        isSent: false,
        timestamp: "10:33 AM",
        isPlaying: false,
      },
      {
        id: "1e",
        type: "voice",
        duration: "0:28",
        isSent: true,
        timestamp: "10:35 AM",
        isPlaying: false,
      },
      {
        id: "1f",
        type: "voice",
        duration: "0:19",
        isSent: false,
        timestamp: "10:37 AM",
        isPlaying: false,
      },
      {
        id: "1g",
        type: "voice",
        duration: "0:34",
        isSent: true,
        timestamp: "10:39 AM",
        isPlaying: false,
      },
      {
        id: "1h",
        type: "voice",
        duration: "0:51",
        isSent: false,
        timestamp: "10:41 AM",
        isPlaying: false,
      },
      {
        id: "1i",
        type: "voice",
        duration: "0:13",
        isSent: true,
        timestamp: "10:43 AM",
        isPlaying: false,
      },
      {
        id: "1j",
        type: "voice",
        duration: "1:05",
        isSent: false,
        timestamp: "10:45 AM",
        isPlaying: false,
      },
      {
        id: "1k",
        type: "voice",
        duration: "0:27",
        isSent: true,
        timestamp: "10:48 AM",
        isPlaying: false,
      },
      {
        id: "1l",
        type: "voice",
        duration: "0:39",
        isSent: false,
        timestamp: "10:50 AM",
        isPlaying: false,
      },
      {
        id: "1m",
        type: "voice",
        duration: "0:22",
        isSent: true,
        timestamp: "10:52 AM",
        isPlaying: false,
      },
      {
        id: "1n",
        type: "voice",
        duration: "0:17",
        isSent: false,
        timestamp: "10:54 AM",
        isPlaying: false,
      },
      {
        id: "1o",
        type: "voice",
        duration: "0:45",
        isSent: true,
        timestamp: "10:55 AM",
        isPlaying: false,
      },
    ],
  },
  {
    id: "2",
    user: {
      name: "Marvin McKinney",
      avatar: null,
      initial: "M",
      color: "#EEEEEE",
      hasStory: false,
      status: "Online",
    },
    messages: [
      {
        id: "2a",
        type: "voice",
        duration: "0:08",
        isSent: false,
        timestamp: "9:15 AM",
        isPlaying: false,
      },
      {
        id: "2b",
        type: "voice",
        duration: "0:19",
        isSent: true,
        timestamp: "9:16 AM",
        isPlaying: false,
      },
      {
        id: "2c",
        type: "voice",
        duration: "0:31",
        isSent: false,
        timestamp: "9:18 AM",
        isPlaying: false,
      },
    ],
  },
  {
    id: "3",
    user: {
      name: "Sarah Johnson",
      avatar: null,
      initial: "S",
      color: "#E3F5FF",
      hasStory: true,
      status: "Last seen 2h ago",
    },
    messages: [
      {
        id: "3a",
        type: "voice",
        duration: "1:05",
        isSent: false,
        timestamp: "Yesterday",
        isPlaying: false,
      },
      {
        id: "3b",
        type: "voice",
        duration: "0:47",
        isSent: true,
        timestamp: "Yesterday",
        isPlaying: false,
      },
      {
        id: "3c",
        type: "voice",
        duration: "0:22",
        isSent: false,
        timestamp: "Yesterday",
        isPlaying: false,
      },
      {
        id: "3d",
        type: "voice",
        duration: "0:38",
        isSent: true,
        timestamp: "Yesterday",
        isPlaying: false,
      },
    ],
  },
  {
    id: "4",
    user: {
      name: "Alex Chen",
      avatar: null,
      initial: "A",
      color: "#FFE8CC",
      hasStory: false,
      status: "Last seen 1d ago",
    },
    messages: [
      {
        id: "4a",
        type: "voice",
        duration: "0:55",
        isSent: true,
        timestamp: "Monday",
        isPlaying: false,
      },
      {
        id: "4b",
        type: "voice",
        duration: "1:22",
        isSent: false,
        timestamp: "Monday",
        isPlaying: false,
      },
      {
        id: "4c",
        type: "voice",
        duration: "0:18",
        isSent: true,
        timestamp: "Monday",
        isPlaying: false,
      },
    ],
  },
  {
    id: "5",
    user: {
      name: "Emily Rodriguez",
      avatar: null,
      initial: "E",
      color: "#E0FFE0",
      hasStory: true,
      status: "Online",
    },
    messages: [
      {
        id: "5a",
        type: "voice",
        duration: "0:27",
        isSent: false,
        timestamp: "8:45 AM",
        isPlaying: false,
      },
      {
        id: "5b",
        type: "voice",
        duration: "0:33",
        isSent: true,
        timestamp: "8:46 AM",
        isPlaying: false,
      },
      {
        id: "5c",
        type: "voice",
        duration: "0:15",
        isSent: false,
        timestamp: "8:48 AM",
        isPlaying: false,
      },
      {
        id: "5d",
        type: "voice",
        duration: "0:09",
        isSent: true,
        timestamp: "8:49 AM",
        isPlaying: false,
      },
      {
        id: "5e",
        type: "voice",
        duration: "1:12",
        isSent: false,
        timestamp: "8:52 AM",
        isPlaying: false,
      },
    ],
  },
  {
    id: "6",
    user: {
      name: "David Kim",
      avatar: null,
      initial: "D",
      color: "#D3E5FF",
      hasStory: false,
      status: "Last seen just now",
    },
    messages: [
      {
        id: "6a",
        type: "voice",
        duration: "0:22",
        isSent: true,
        timestamp: "11:10 AM",
        isPlaying: false,
      },
      {
        id: "6b",
        type: "voice",
        duration: "0:18",
        isSent: false,
        timestamp: "11:11 AM",
        isPlaying: false,
      },
      {
        id: "6c",
        type: "voice",
        duration: "0:45",
        isSent: true,
        timestamp: "11:12 AM",
        isPlaying: false,
      },
      {
        id: "6d",
        type: "voice",
        duration: "0:33",
        isSent: false,
        timestamp: "11:15 AM",
        isPlaying: false,
      },
    ],
  },
];
