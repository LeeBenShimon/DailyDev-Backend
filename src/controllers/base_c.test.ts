import { Request, Response } from "express";
import { Model, Document, FilterQuery } from "mongoose";
import createController from "./base_controller";

jest.mock("express");
jest.mock("mongoose");

describe('createController', () => {
  it('should expose a function', () => {
		expect(createController).toBeDefined();
	});
  
  it('createController should return expected output', () => {
    // const retValue = createController(model);
    expect(false).toBeTruthy();
  });
});