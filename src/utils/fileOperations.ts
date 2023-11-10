import matter = require("gray-matter");
import { join } from "path";
import { writeFile, readFile } from "fs/promises";
import { PilePost } from "./types";
import { getFilePathForNewPost, getRelativeFilePath } from "../helpers";
import { showToast } from "@raycast/api";

class PileOperations {
  public static generateMarkdownFile = (content: string, data: any) => {
    return matter.stringify(content, data, { engines: { JSON } });
  };

  public static addFileToIndex = async (path: string, data: PilePost) => {
    const filePath = join(path, "index.json");
    const fileData = readFile(filePath, "utf-8");
    const tempData = await fileData;
    const parsedData = JSON.parse(tempData.toString());
    const newData = [[getRelativeFilePath(), data], ...parsedData];
    const fileContents = JSON.stringify(newData);
    await writeFile(filePath, fileContents, "utf-8");
  };

  public static readFile = async (path: string) => {
    return new Promise((resolve, reject) => {
      readFile(path, "utf-8")
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  public static saveFile = async (path: string, data: string) => {
    return new Promise((resolve, reject) => {
      writeFile(getFilePathForNewPost(path), data, "utf-8")
        .then(() => {
          resolve("File written successfully");
          showToast({ title: "Created Pile Post", message: "Successfully created Pile Post" });
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
}

export default PileOperations;
