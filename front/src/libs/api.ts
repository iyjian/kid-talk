// import { Table, Project, Code } from "@/types";
import { RequestBase } from './RequestBase'

class APIClient extends RequestBase {
  constructor() {
    super()
  }

  public getSession(sessionId: number) {
    return this.request.get(`/api/chatrepo/session/${sessionId}`)
  }

  public getLatestSession () {
    return this.request.get(`/api/chatrepo/session/latest`)
  }
}

export const apiClient = new APIClient()
