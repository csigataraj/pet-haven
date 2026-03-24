import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ChatbotService } from './chatbot.service';

describe('ChatbotService', () => {
  let service: ChatbotService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [ChatbotService] });
    service = TestBed.inject(ChatbotService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts message payload to chatbot endpoint', () => {
    const history = [{ role: 'user' as const, content: 'hello' }];

    service.sendMessage('how are you', history).subscribe((response) => {
      expect(response.reply).toBe('ok');
      expect(response.conversationHistory.length).toBe(2);
    });

    const req = httpMock.expectOne('/api/chatbot/message');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.message).toBe('how are you');
    expect(req.request.body.conversationHistory).toEqual(history);
    req.flush({
      reply: 'ok',
      conversationHistory: [...history, { role: 'assistant', content: 'ok' }]
    });
  });
});
