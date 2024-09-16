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

  public makeSentence (payload: any) {
    return this.request.post(`/api/chatrepo/phrase/sentence`, payload)
  }
}

export const apiClient = new APIClient()
