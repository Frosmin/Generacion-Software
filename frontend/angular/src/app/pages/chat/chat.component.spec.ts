import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatComponent } from './chat.component';
import { Component, OnInit } from '@angular/core'; 
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatComponent]
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
