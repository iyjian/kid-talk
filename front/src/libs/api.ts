// import { Table, Project, Code } from "@/types";
import { RequestBase } from './RequestBase'

class APIClient extends RequestBase {
  constructor() {
    super()
  }

  public getSession(sessionId: number) {
    return this.request.get(`/api/chatrepo/session/${sessionId}`)
  }

  public getLatestSession() {
    return this.request.get(`/api/chatrepo/session/latest`)
  }

  public makeSentence(payload: any) {
    return this.request.post(`/api/chatrepo/phrase/sentence`, payload)
  }

  public createSpeech(payload: any, config?: any) {
    return this.request.post(`/api/openai/speech`, payload, config)
  }

  public getAllPhraseSentences(params: any) {
    return this.request.get(`/api/phraseSentence`, { params })
  }

  public getOnePhraseSentenceWithAudio(id: any) {
    return this.request.get(`/api/phraseSentence/${id}`)
  }

  public getAllUnits(params: any) {
    return this.request.get(`/api/phraseSentence/unit`, { params })
  }

  public getUserDetail(token: any) {
    return this.request.get(`/api/auth/users/detail/${token}`);
  } 
}

export const apiClient = new APIClient()
