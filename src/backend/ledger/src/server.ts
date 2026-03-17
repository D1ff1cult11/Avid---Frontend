import { createApp } from "./app";
import { loadEnvConfig } from "./config/env";
import { logger } from "./config/logger";
import { ElectionController } from "./controllers/electionController";
import { LedgerController } from "./controllers/ledgerController";
import { MembershipController } from "./controllers/membershipController";
import { initializeDatabase } from "./db/init";
import { SQLiteClient } from "./db/sqlite";
import { ElectionRepository } from "./repositories/electionRepo";
import { LedgerRepository } from "./repositories/ledgerRepo";
import { ServerRepository } from "./repositories/serverRepo";
import { ElectionService } from "./services/electionService";
import { LedgerService } from "./services/ledgerService";
import { MembershipService } from "./services/membershipService";

async function bootstrap(): Promise<void> {
  const env = loadEnvConfig();

  const db = new SQLiteClient(env.sqliteDbPath);
  await db.initialize();
  await initializeDatabase(db);

  const electionRepo = new ElectionRepository(db);
  const serverRepo = new ServerRepository(db);
  const ledgerRepo = new LedgerRepository(db);

  const electionService = new ElectionService(electionRepo);
  const ledgerService = new LedgerService(ledgerRepo);
  const membershipService = new MembershipService(
    db,
    electionRepo,
    serverRepo,
    ledgerService,
    env.ecPublicKeyPem
  );

  const app = createApp({
    electionController: new ElectionController(electionService, membershipService),
    membershipController: new MembershipController(membershipService),
    ledgerController: new LedgerController(ledgerService)
  });

  const server = app.listen(env.port, () => {
    logger.info("Ledger service started", {
      port: env.port,
      sqliteDbPath: env.sqliteDbPath
    });
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info("Shutting down server", { signal });
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
    await db.close();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });
  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

void bootstrap().catch((error: unknown) => {
  logger.error("Failed to start ledger service", {
    error: error instanceof Error ? error.message : String(error)
  });
  process.exit(1);
});
