# Liam Brem - MetaU Capstone

InternAll’s purpose is to give new employees, interns, or college students the ability to cooperatively work with managers to keep track of all of this information as well as easy access to any tool they may frequently need. 

[Project Plan Doc](https://docs.google.com/document/d/17RSJuYlG4pfWKkTmupSPv2IiZi_5vMlE9Ugr8SYhYK4/edit?usp=sharing)
[Hosted Version](https://internall.onrender.com)


Below is an overview of the features I’ve completed for the capstone:

**MVP:**
- Authentication Integration with Auth0: Working with a preexisting Auth framework, while also maintaining session persistence and secure routing.
- Responsive, Flexible UI Architecture: Designing a frontend that’s intuitive for MVP users but modular enough to support drag-and-drop, collaboration, and multi-view editing required careful component design and state flow control.
- Custom UI Animation: The background of the application is animated using a combination of JavaScript animation frames and CSS. Additionally, there is a custom ‘ring’ animation that shows when another user is editing an item within the same room. These are accompanied by clean hover and size transitions throughout the project. 
- Unique Cursor Interaction: Other users’ cursors are displayed in realtime with their designated color. Furthermore, when users hover over the avatars in the navbar, a tooltip appears with their username. 
- Multiple Views: Users can switch between a board (grid) and a list view depending on their preference. 
- Drag and Drop State Management: Creating a smooth drag-and-drop experience with card rearrangement across sections necessitated custom state logic, event handling, and UI feedback systems,especially to allow future real-time synchronization.
- Database Modeling for Extensibility: Even in the MVP, the schema needed to anticipate features like shared documents, item history, and semantic metadata, without overcomplicating early implementation.
- API Design for Clarity and Scalability: Ensuring clean, versioned API routes with clearly defined responsibilities and separation from socket-based real-time logic was critical to long-term maintainability.
- Loading State Spinner: providing users with immediate visual feedback during authentication and react mounting without interrupting the overall app experience.


**TC1 - Multi-User Realtime Editing:**
- Room-Based Collaboration: Isolate collaboration events so users only receive updates related to their shared document.
- Conflict Resolution: Prevent destructive overlap when multiple users attempt to edit the same element.
- Log Component:
- UI State Synchronization: Ensure minimal latency and no duplicated rendering when syncing changes across users.
- User Presence: Show real-time indicators of users viewing/editing a document.
- Unique Cursor Interaction: Other users’ cursors are displayed in realtime with their designated color. Furthermore, when users hover over the avatars in the navbar, a tooltip appears with their username. 
- Performance: Manage high-frequency events and simultaneous user activity efficiently.

**TC2 - Intelligent Search:**
- Custom Fuzzy Matching with Levenshtein Distance: Supporting typo tolerance requires computing string similarity across multiple fields in real time. Implementing Levenshtein Distance efficiently, especially over large datasets, demands careful optimization to avoid latency in user search.
- Semantic Search Using ML Embeddings: Generating and comparing embeddings introduces latency and compute overhead. Building a separate microservice, asynchronous job queue, and caching layer is necessary to ensure search remains fast while supporting deep semantic understanding.
- Performance Optimization: Balancing intelligent search features with low-latency UX is challenging. Caching, job queues, debouncing, and modular service design are all required to prevent bottlenecks from ML workloads and ensure the system scales.
- External API Integration: DuckDuckGo Instant Answers: Integrating external APIs without exposing keys or blocking the UI introduces architectural complexity. Creating a backend proxy and gracefully merging third-party data into internal results requires careful coordination and error handling.
- Graph Search: Maintaining and traversing an in-memory semantic graph adds contextual depth but requires efficient updates and scoring logic. The traversal must balance search breadth and accuracy while staying performant at scale.
- Relevancy Scoring (Frequency & Recency): Tracking user behavior to personalize results demands real-time logging, background aggregation, and lightweight storage. Combining these scores with other match types without overfitting adds algorithmic complexity.
Autocomplete: 
- Combined Search Algorithm with Dynamic Weights: Merging fuzzy, semantic, graph, and usage-based scores into one unified ranking is technically intricate. Dynamically adjusting weights based on usage patterns introduces statistical complexity and requires robust calibration over time.

**TC3 - Offline Editing:**
- Local Edit Queue: All user actions (create, edit, delete, reorder, move) are stored in localStorage when offline, with full payload and timestamp for later replay.
- Deferred Sync: When connectivity is restored, pending edits are replayed sequentially, with API calls for each action type.
- Conflict Resolution: The sync logic checks for server-side changes (404 for deleted, 409 for modified) and skips or logs conflicts, ensuring no destructive overwrites.
- UI Feedback: Users see logs for offline actions, sync status, and conflict outcomes, maintaining transparency and trust.
- Optimistic UI Updates: The UI immediately reflects offline changes, using temporary IDs and flags, so users never wait for network roundtrips


**Required Features**
- [x] TC1: Sockets
- [x] TC2: Search
- [x] App interacts with a database
- [x] App interacts with at least 1 API
- [x] Users can log in/out
- [x] User can sign up with a new profile
- [x] App has multiple views
- [x] App has interesting cursor interaction
- [x] App demonstrates at least 1 component with complex visual styling
- [x] App has a loading state to create visual polish