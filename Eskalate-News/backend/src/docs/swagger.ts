import { Application, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi";

export const mountSwagger = (app: Application) => {
  app.get("/api/docs.json", (_req: Request, res: Response) => {
    res.status(200).json(openApiDocument);
  });

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
};

