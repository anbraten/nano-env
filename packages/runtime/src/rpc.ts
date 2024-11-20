export class RPC {
  private _responseHandler = new Map<
    string,
    {
      timeoutId: Timer;
      resolve: (value: any) => void;
      reject: (reason?: any) => void;
    }
  >();
  private _port: MessagePort;
  private _handleRequest?: (event: MessageEvent) => Promise<any> | any;

  constructor(
    worker: MessagePort,
    handleRequest?: (event: MessageEvent) => Promise<any> | any
  ) {
    this._port = worker;
    this._handleRequest = handleRequest;
    this._port.addEventListener('message', this.handleMessage.bind(this));
    this._port.start();
  }

  public unload() {
    this._port.removeEventListener('message', this.handleMessage.bind(this));
    this._responseHandler.forEach((handler) => {
      clearTimeout(handler.timeoutId);
      handler.reject(new Error('RemoteFS instance was unloaded'));
    });
    this._responseHandler.clear();
  }

  private async handleMessage(event: MessageEvent) {
    if (event.data.response) {
      this.handleResponse(event);
    } else if (event.data.request) {
      if (this._handleRequest === undefined) {
        throw new Error("This endpoint can't handle requests. No handler set");
      }

      const response = await this._handleRequest(event);
      if (response === undefined) {
        return;
      }
      this._port.postMessage({ response: event.data.request, ...response });
    } else {
      console.log('Unknown message', event.data);
    }
  }

  private async handleResponse(event: MessageEvent) {
    const { response, ...data } = event.data;
    const handler = this._responseHandler.get(response);
    if (handler === undefined) {
      throw new Error(`No handler found for response with id: ${response}`);
    }
    try {
      if (data.error) {
        handler.reject(data.error);
        return;
      } else {
        handler.resolve(data);
      }
    } catch (error) {
      handler.reject(error);
    }
  }

  private post(data: any): void {
    this._port.postMessage(data);
  }

  public async request<T, S = any>(type: string, data: S): Promise<T> {
    const id = Math.random().toString(16).slice(2);

    const responsePromise = new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout waiting for response with id: ${id}`));
        this._responseHandler.delete(id);
      }, 5000);

      this._responseHandler.set(id, {
        timeoutId,
        resolve,
        reject,
      });
    });

    this.post({ type, request: id, ...data });

    return responsePromise;
  }
}
