const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");
const app = require("../app");
const { roomActions, itemEvents, cursorEvents } = require("../utils/constants");

describe("Socket functionality tests", () => {
    let httpServer;
    let httpServerAddr;
    let ioServer;
    let clientSocket;

    beforeAll((done) => {
        httpServer = createServer(app);
        ioServer = new Server(httpServer);
        httpServer.listen(() => {
            httpServerAddr = httpServer.address();
            done();
        });

        require("../socket/socket")(ioServer);
    });

    afterAll(() => {
        ioServer.close();
        httpServer.close();
    });

    beforeEach((done) => {
        // create a new client socket connection before each test
        clientSocket = new Client(`http://localhost:${httpServerAddr.port}`);
        clientSocket.on("connect", done);
    });

    afterEach(() => {
        if (clientSocket.connected) {
            clientSocket.disconnect();
        }
    });

    describe("Basic socket connection", () => {
        it("should connect to the server", () => {
            expect(clientSocket.connected).toBe(true);
        });

        it("should have a socket id", () => {
            expect(clientSocket.id).toBeDefined();
        });
    });

    describe("Room management", () => {
        it("should allow user to join a room", (done) => {
            const testData = {
                roomId: "testroom",
                userId: "testuser123",
                nickname: "Test User"
            };

            clientSocket.on(roomActions.USERS, (users) => {
                expect(Array.isArray(users)).toBe(true);
                expect(users.length).toBe(1);
                expect(users[0].id).toBe(testData.userId);
                expect(users[0].nickname).toBe(testData.nickname);
                expect(users[0]).toHaveProperty("color");
                done();
            });

            clientSocket.emit(roomActions.JOIN, testData);
        });

        it("should get room users", (done) => {
            const testData = {
                roomId: "testroom",
                userId: "testuser123",
                nickname: "Test User"
            };

            clientSocket.emit(roomActions.JOIN, testData);

            // request room users
            clientSocket.on(roomActions.USERS, (users) => {
                if (users.length > 0) {
                    expect(users[0].id).toBe(testData.userId);
                    done();
                }
            });
        });

        it("should emit events when joining a room", (done) => {
            const testData = {
                roomId: "testroom",
                userId: "testuser123",
                nickname: "Test User"
            };

            // test that the join event triggers a response
            clientSocket.on(roomActions.USERS, (users) => {
                expect(users).toBeDefined();
                expect(Array.isArray(users)).toBe(true);
                done();
            });

            clientSocket.emit(roomActions.JOIN, testData);
        });
    });

    describe("Cursor events", () => {
        it("should handle cursor movement", (done) => {
            // create a second client to receive the cursor update
            const clientSocket2 = new Client(`http://localhost:${httpServerAddr.port}`);
            
            clientSocket2.on("connect", () => {
                clientSocket.emit(roomActions.JOIN, {
                    roomId: "testroom",
                    userId: "user1",
                    nickname: "User 1"
                });
                
                clientSocket2.emit(roomActions.JOIN, {
                    roomId: "testroom",
                    userId: "user2", 
                    nickname: "User 2"
                });

                // listen for cursor updates on the second client
                clientSocket2.on(cursorEvents.CURSOR_UPDATE, (data) => {
                    expect(data.userId).toBe("user1");
                    expect(data.color).toBe("#ff6b6b");
                    expect(data.x).toBe(100);
                    expect(data.y).toBe(200);
                    
                    clientSocket2.disconnect();
                    done();
                });

                // send cursor movement from first client
                setTimeout(() => {
                    clientSocket.emit(cursorEvents.CURSOR_MOVE, {
                        roomId: "testroom",
                        userId: "user1",
                        color: "#ff6b6b",
                        x: 100,
                        y: 200
                    });
                }, 100);
            });
        });

        it("should handle component drag events", (done) => {
            const clientSocket2 = new Client(`http://localhost:${httpServerAddr.port}`);
            
            clientSocket2.on("connect", () => {
                clientSocket.emit(roomActions.JOIN, {
                    roomId: "testroom",
                    userId: "user1",
                    nickname: "User 1"
                });
                
                clientSocket2.emit(roomActions.JOIN, {
                    roomId: "testroom",
                    userId: "user2",
                    nickname: "User 2"
                });

                // test drag event
                clientSocket2.on(cursorEvents.COMPONENT_DRAG_START, (data) => {
                    expect(data.componentId).toBe("comp1");
                    clientSocket2.disconnect();
                    done();
                });

                setTimeout(() => {
                    clientSocket.emit(cursorEvents.COMPONENT_DRAG_START, {
                        roomId: "testroom",
                        componentId: "comp1",
                        userId: "user1"
                    });
                }, 100);
            });
        });
    });

    describe("Event emission", () => {
        it("should emit events without errors", (done) => {
            const testData = {
                roomId: "testroom",
                userId: "testuser123",
                itemId: "item123"
            };

            // test that events can be emitted without throwing errors
            try {
                clientSocket.emit(itemEvents.ITEM_EDITING_START, testData);
                clientSocket.emit(itemEvents.ITEM_EDITING_STOP, { 
                    roomId: testData.roomId, 
                    userId: testData.userId 
                });
                
                setTimeout(() => {
                    done();
                }, 100);
            } catch (error) {
                done(error);
            }
        });

        it("should handle multiple event emissions", (done) => {
            const events = [
                { event: roomActions.JOIN, data: { roomId: "test", userId: "user1", nickname: "User" } },
                { event: cursorEvents.CURSOR_MOVE, data: { roomId: "test", x: 10, y: 20 } },
                { event: roomActions.LEAVE, data: { roomId: "test" } }
            ];

            try {
                events.forEach(({ event, data }) => {
                    clientSocket.emit(event, data);
                });
                
                setTimeout(() => {
                    done();
                }, 100);
            } catch (error) {
                done(error);
            }
        });
    });

    describe("Connection handling", () => {
        it("should handle client disconnect", (done) => {
            const testData = {
                roomId: "testroom",
                userId: "testuser123",
                nickname: "Test User"
            };

            clientSocket.on(roomActions.USERS, (users) => {
                expect(users.length).toBe(1);
                
                // disconnect and verify no errors
                clientSocket.disconnect();
                
                setTimeout(() => {
                    done();
                }, 100);
            });

            clientSocket.emit(roomActions.JOIN, testData);
        });
    });
});