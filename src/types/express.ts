import { Request } from "express";

export type TypedRequest<
  Body extends object | unknown = Record<string, unknown>,
  URLParams extends object | unknown = Record<string, unknown>,
  QueryParams extends object | unknown = Record<string, unknown>,
> = Request<URLParams, unknown, Body, QueryParams>;
