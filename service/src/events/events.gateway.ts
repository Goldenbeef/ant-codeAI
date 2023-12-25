import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  // WsResponse,
} from '@nestjs/websockets';
// import { from, Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
import { Server } from 'ws';
import * as WebSocket from 'ws';
import { streamGenerateCode } from './generateCode';
import { cacheFileChunk, mergeFile, TempCacheFile } from './tempCacheFile';

@WebSocketGateway(3000)
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('generatecode')
  async generateCode(client: WebSocket, data: any): Promise<void> {
    /**
     {
      generationType: 'create',
      image: 'image',
      openAiApiKey: '****',
      openAiBaseURL: '****',
      screenshotOneApiKey: null,
      isImageGenerationEnabled: true,
      editorTheme: 'cobalt',
      generatedCodeConfig: 'react_tailwind',
      isTermOfServiceAccepted: false,
      accessCode: null
    }
     */
    if (data.isChunk) {
      data.image = TempCacheFile.get(data.image)['full'];
    }
    await streamGenerateCode(data, client);
    TempCacheFile.delete(data.hash);
    client.close();
  }

  @SubscribeMessage('uploadFile')
  async uploadFile(client: WebSocket, data: any): Promise<void> {
    if (data.handler === 'mergeUploadFile') {
      mergeFile(data.hash, client);
    } else {
      cacheFileChunk(data, client);
    }
  }
}
