import { Request } from "express";

export type TypedRequest<
  Body extends object = Record<string, unknown>,
  URLParams extends object = Record<string, unknown>,
  QueryParams extends object = Record<string, unknown>,
> = Request<URLParams, unknown, Body, QueryParams>;
