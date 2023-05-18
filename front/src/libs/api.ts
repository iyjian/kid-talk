// import { Table, Project, Code } from "@/types";
import { RequestBase } from "./RequestBase";

class APIClient extends RequestBase {
  constructor() {
    super();
  }
  
  public getSession(sessionId: number) {
    return this.request.get(`/api/chatrepo/session/${sessionId}`)
  }
}

export const apiClient = new APIClient()
