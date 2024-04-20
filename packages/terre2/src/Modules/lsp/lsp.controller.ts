import { Body, Controller, Post } from '@nestjs/common';
import {
  Connection,
  CompletionList,
  CompletionParams,
  NotificationType,
} from 'vscode-languageserver';
import { LspService } from './lsp.service';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import {
  WebSocketMessageReader,
  WebSocketMessageWriter,
} from './lspEsmAdapter';
import { createWsConnection } from './webgalLsp';

class CompletionDto {
  @ApiProperty({
    description: 'Editor input value for which the completion is required',
  })
  editorValue: string;

  @ApiProperty({ description: 'Parameters required for completion' })
  params: CompletionParams;
}

@Controller('api/lsp')
@ApiTags('LSP')
export class LspController {
  constructor(private readonly myLanguageService: LspService) {}

  @Post('compile')
  @ApiOperation({ summary: 'Get code completions based on given input' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched the completion list.',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to fetch the completion list.',
  })
  async compile(@Body() data: CompletionDto): Promise<CompletionList> {
    return this.myLanguageService.completion(data.params, data.editorValue);
  }
}

function toIWebSocket(ws: WebSocket): any {
  return {
    send: (content) => {
      //console.log(`contents = ${content}`);
      ws.send(content);
    },
    onMessage: (cb) =>
      (ws.onmessage = (event) => {
        console.log(event.data);
        cb(event.data);
      }),
    onError: (cb) =>
      (ws.onerror = (event) => {
        if ('message' in event) {
          cb((event as any).message);
        }
      }),
    onClose: (cb) => (ws.onclose = (event) => cb(event.code, event.reason)),
    dispose: () => ws.close(),
  };
}

@WebSocketGateway({
  path: '/api/lsp2',
  transports: 'websocket',
})
export class LspGateway {
  @WebSocketServer()
  private server: Server;

  afterInit(server: Server) {
    this.server = server;
    this.listenForMessages();
  }

  private pipeSocket(ws) {
    const reader = new WebSocketMessageReader(ws);
    const writer = new WebSocketMessageWriter(ws);
    createWsConnection(reader, writer);
  }

  listenForMessages() {
    this.server.on('connection', (ws) => {
      this.pipeSocket(toIWebSocket(ws));
    });
  }
}
