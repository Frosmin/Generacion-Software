import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatComponent } from './chat.component'; 
import { HttpClientTestingModule } from '@angular/common/http/testing'; 
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 
describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatComponent, HttpClientTestingModule, FormsModule, CommonModule],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
