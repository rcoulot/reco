// http://localhost:3000/boardgame/index.html
// ################################################################################################
namespace reco.boardgame {
    // ============================================================================================
    console.log("Board Game");
    let session1 = new Session("board1", "S1");
    let session2 = new Session("board2", "S2"); //, false);
    session2.board.svgElt.setAttribute("transform", "rotate(180)")
    session1.synchronizer.addRemoteSession(new RemoteSession(session2));
    session2.synchronizer.addRemoteSession(new RemoteSession(session1));

    let H = session1.board.height;
    let W = session1.board.width;
    let C = session1.board.center;
    console.log(`W=${W}, H=${H}, C=${C.x}x${C.y}`)

    session1.board.addItem({ x: 0, y: 0 }, "cyanZone").addRect({ "width": W, "height": H / 4 }, { x: 0, y: 0 }, "cyan");
    session1.board.addItem({ x: 0, y: 0 }, "grayZone").addRect({ "width": W, "height": H / 2 }, { x: 0, y: H / 4 }, "darkgray");
    session1.board.addItem({ x: 0, y: 0 }, "yellowZone").addRect({ "width": W, "height": H / 4 }, { x: 0, y: H * 3 / 4 }, "yellow");

    session1.board.itemDict["cyanZone"].onTop = true;
    session2.board.itemDict["yellowZone"].onTop = true;

    {
        let item = session1.board.addItem(pointTranslate(C, { width: -100, height: -25 }), "I1");
        item.addText("Mario 1");
        item.addImage("./images/mario.png", { width: 50, height: 50 });
        item.setMovable(true);
    }
    {
        let item = session1.board.addItem(pointTranslate(C, { width: 100, height: -25 }), "I2");
        item.addText("Mario 2");
        item.addImage("./images/mario.png", { width: 50, height: 50 });
        item.setMovable(true);
    }
    // ============================================================================================
}
// ################################################################################################
