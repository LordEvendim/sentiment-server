import { Request } from "express";

export type TypedRequest<
  Body extends Record<string, unknown> = Record<string, never>,
  URLParams extends Record<string, string> = Record<string, never>,
  QueryParams extends Record<string, string> = Record<string, never>,
> = Request<URLParams, unknown, Body, QueryParams>;
