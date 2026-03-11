import { Router } from "express";
import { ElectionController } from "../controllers/electionController";
import { LedgerController } from "../controllers/ledgerController";
import { MembershipController } from "../controllers/membershipController";

export interface Controllers {
  electionController: ElectionController;
  membershipController: MembershipController;
  ledgerController: LedgerController;
}

export function createApiRouter(controllers: Controllers): Router {
  const router = Router();

  router.post("/elections", controllers.electionController.createElection);
  router.get("/elections", controllers.electionController.listElections);
  router.get("/elections/:id", controllers.electionController.getElectionById);
  router.get("/elections/:id/servers", controllers.electionController.getElectionServers);

  router.post("/join", controllers.membershipController.join);
  router.post("/leave", controllers.membershipController.leave);
  router.post("/revoke", controllers.membershipController.revoke);
  router.get("/servers/:serverId", controllers.membershipController.getByServerId);

  router.get("/ledger", controllers.ledgerController.listLedger);
  router.get("/ledger/:logId", controllers.ledgerController.getById);

  return router;
}
