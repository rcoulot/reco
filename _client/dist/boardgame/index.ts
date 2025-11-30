// http://localhost:3000/boardgame/index.html
// ################################################################################################
namespace reco.boardgame {
    // ============================================================================================
    console.log("Board Game");
    let session1 = new Session("board1",{ width: 100, height: 100 }, "S1");
    let session2 = new Session("board2", { width: 100, height: 100 }, "S2"); //, false);
    session2.board.svgElt.setAttribute("transform", "rotate(180)")
    session1.synchronizer.addRemoteSession(new RemoteSession(session2));
    session2.synchronizer.addRemoteSession(new RemoteSession(session1));

    session1.board.addItem({ x: 25, y: 0 }, "northZone").addRect({ "width": 50, "height": 25 }, { x: 0, y: 0 }, "cyan");
    session1.board.addItem({ x: 0, y: 25 }, "westZone").addRect({ "width": 25, "height": 50 }, { x: 0, y: 0 }, "blue");
    session1.board.addItem({ x: 25, y: 25 }, "centerZone").addRect({ "width": 50, "height": 50 }, { x: 0, y: 0 }, "darkgray");
    session1.board.addItem({ x: 75, y: 25 }, "eastZone").addRect({ "width": 25, "height": 50 }, { x: 0, y: 0 }, "green");
    session1.board.addItem({ x: 25, y: 75 }, "southZone").addRect({ "width": 50, "height": 25 }, { x: 0, y: 0 }, "yellow");

    session1.board.itemDict["northZone"].onTop = true;
    session1.board.itemDict["westZone"].onTop = true;
    session1.board.itemDict["eastZone"].onTop = true;
    session2.board.itemDict["southZone"].onTop = true;
    session2.board.itemDict["westZone"].onTop = true;
    session2.board.itemDict["eastZone"].onTop = true;
    {
        let item = session1.board.addItem({ x: 30, y: 30 }, "I1");
        item.addText("Mario 1",{x:0,y:0});
        item.addImage("./images/mario.png", { width: 10, height: 10 });
        item.setMovable(true);
    }
    {
        let item = session1.board.addItem({ x: 55, y: 30 }, "I2");
        item.addText("Mario 2",{x:0,y:0});
            item.addImage("./images/mario.png", { width: 10, height: 10 });
            item.setMovable(true);
        }
    
    // ============================================================================================
}
// ################################################################################################
