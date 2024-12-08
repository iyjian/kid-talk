import axios from 'axios'
import type { AxiosInstance } from 'axios'
// import { ElMessage } from "element-plus";
import router from './../router'
import { useAdminStore } from "@/stores/user";

export class RequestBase {
  private readonly TIMEOUT = 900000

  protected request: AxiosInstance

  constructor() {
    this.request = axios.create({
      // baseURL: import.meta.env.VITE_API_ENDPOINT,
      timeout: this.TIMEOUT
    })

    this.request.interceptors.request.use((config: any) => {
      const adminStore = useAdminStore();
      config.headers['token'] = adminStore?.user.token
      return config
    })

    this.request.interceptors.response.use(
      (response) => {
        if (response.data.err) {
          if (response.data.err === 700) {
            router.push('/login')
          }
          return Promise.reject(new Error(response.data.errMsg))
        }
        return response
      },
      (error) => {
        // ElMessage.error({
        //   showClose: true,
        //   message: error,
        // });
        // return Promise.reject(error);
      }
    )
  }
}
