document.addEventListener("DOMContentLoaded", function () {
  const videoList = document.getElementById("video-list");
  const videoPlayer = document.getElementById("player");
  const videoTitle = document.getElementById("video-title");
  const videoDetails = document.getElementById("video-details");
  const commentsList = document.getElementById("comments-list");
  const summarySection = document.getElementById("summary");
  const newComment = document.getElementById("new-comment");
  const addCommentButton = document.getElementById("add-comment");
  const searchInput = document.getElementById("search");

  const videos = [
    {
      title: "The Stand Off",
      year: 2012,
      genre: "Animation, Comedy",
      duration: "7:00",
      type: "local",
      file: "videos/shaun_the_sheep_s03e01.mkv",
      thumbnail: "thumbnails/shaun_the_sheep_s03e01.jpg",
      comments: [
        { text: "Exciting episode!", sentiment: "positive" },
        { text: "Loved the plot!", sentiment: "positive" },
        { text: "Shaun is a great leader.", sentiment: "positive" },
      ],
    },
    {
      title: "The Coconut",
      year: 2012,
      genre: "Animation, Comedy",
      duration: "7:00",
      type: "local",
      file: "videos/shaun_the_sheep_s03e02.mkv",
      thumbnail: "thumbnails/shaun_the_sheep_s03e02.jpg",
      comments: [
        { text: "Hilarious!", sentiment: "positive" },
        { text: "So much fun.", sentiment: "positive" },
        { text: "Great for kids.", sentiment: "positive" },
      ],
    },
    {
      title: "You Missed a Bit",
      year: 2012,
      genre: "Animation, Comedy",
      duration: "7:00",
      type: "dash",
      file: "videos/shaun_the_sheep_s03e03.mkv",
      thumbnail: "thumbnails/shaun_the_sheep_s03e03.jpg",
      comments: [
        { text: "Very funny!", sentiment: "positive" },
        { text: "Loved Bitzer's antics.", sentiment: "positive" },
        { text: "A must-watch.", sentiment: "positive" },
      ],
    },
    {
      title: "Let's Spray",
      year: 2012,
      genre: "Animation, Comedy",
      duration: "7:00",
      type: "dash",
      file: "videos/shaun_the_sheep_s03e04.mkv",

      thumbnail: "thumbnails/shaun_the_sheep_s03e04.jpg",
      comments: [
        { text: "Creative and fun!", sentiment: "positive" },
        { text: "Shaun is so mischievous.", sentiment: "positive" },
        { text: "Great episode.", sentiment: "positive" },
      ],
    },
    {
      title: "The Crow",
      year: 2012,
      genre: "Animation, Comedy",
      duration: "7:00",
      type: "cdn_dash",
      file: "https://multimedia0sarvin.arvanvod.ir/7D4zwNpR1q/eLmjJeXqA0/h_,144_200,240_400,360_800,k.mp4.list/manifest.mpd",
      thumbnail:
        "https://multimedia0sarvin.arvanvod.ir/7D4zwNpR1q/eLmjJeXqA0/thumbnail.jpg",
      comments: [
        { text: "Loved the crow!", sentiment: "positive" },
        { text: "So entertaining.", sentiment: "positive" },
        { text: "Funny and engaging.", sentiment: "positive" },
      ],
    },
    {
      title: "Shaun the Fugitive",
      year: 2012,
      genre: "Animation, Comedy",
      duration: "7:00",
      type: "cdn_hls",
      file: "https://multimedia0sarvin.arvanvod.ir/7D4zwNpR1q/xAnjpXjmyM/h_,144_200,240_400,360_800,k.mp4.list/master.m3u8",
      thumbnail:
        "https://multimedia0sarvin.arvanvod.ir/7D4zwNpR1q/xAnjpXjmyM/thumbnail.jpg",
      comments: [
        { text: "Action-packed!", sentiment: "positive" },
        { text: "Exciting plot.", sentiment: "positive" },
        { text: "Shaun is the best!", sentiment: "positive" },
      ],
    },
  ];
  // Function to update video details and comments
  function updateVideoDetails(video) {
    videoPlayer.src = video.file;
    videoTitle.textContent = video.title;
    videoPlayer.title = video.title; // Update iframe title
    videoTitle.textContent = video.title;
    videoDetails.textContent = `Duration: ${video.duration}, Genre: ${video.genre}, Year: ${video.year}`;
    commentsList.innerHTML = "";
    video.comments.forEach((comment, index) => {
      const commentItem = document.createElement("li");
      commentItem.textContent = `${comment.text} (${comment.sentiment})`;
      commentItem.id = `comment-${index}`;
      commentsList.appendChild(commentItem);
    });

    // Get and display the summary
    getSummary(video.details);

    // Analyze and display the sentiment of comments
    const comments = video.comments.map((comment) => comment.text);
    analyzeComments(comments);
  }

  // Function to send text to the summarization endpoint
  function getSummary(text) {
    fetch("/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text }),
    })
      .then((response) => response.json())
      .then((data) => {
        summarySection.innerText = data.summary;
      })
      .catch((error) => console.error("Error:", error));
  }

  // Function to send comments to the sentiment analysis endpoint
  function analyzeComments(comments) {
    fetch("/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comments: comments }),
    })
      .then((response) => response.json())
      .then((results) => {
        results.forEach((result, index) => {
          document.getElementById(
            `comment-${index}`
          ).textContent = `${result.text} (${result.sentiment})`;
        });
      })
      .catch((error) => console.error("Error:", error));
  }

  // Create video items dynamically
  videos.forEach((video) => {
    const videoItem = document.createElement("div");
    videoItem.className = "video-item"; // Add a class for styling
    videoItem.innerHTML = `<img src="${video.thumbnail}" alt="${video.title}" />`;
    videoItem.addEventListener("click", () => {
      updateVideoDetails(video);
    });

    videoList.appendChild(videoItem);
  });
  // Handle new comments submission
  addCommentButton.addEventListener("click", () => {
    const commentText = newComment.value;
    if (commentText) {
      const video = videos.find((v) => v.title === videoTitle.textContent);
      video.comments.push({ text: commentText, sentiment: "pending" });
      updateVideoDetails(video);
      newComment.value = "";
    }
  });

  // Handle video search
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    videoList.innerHTML = "";
    videos
      .filter((video) => video.title.toLowerCase().includes(searchTerm))
      .forEach((video) => {
        const videoItem = document.createElement("div");
        videoItem.className = "video-item"; // Add a class for styling
        videoItem.innerHTML = `<img src="${video.thumbnail}" alt="${video.title}" /> <h3>${video.title}</h3>`;
        videoItem.addEventListener("click", () => {
          updateVideoDetails(video);
        });
        videoList.appendChild(videoItem);
      });
  });
});