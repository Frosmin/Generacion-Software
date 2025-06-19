import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    this.adjustCarouselAnimation();

    window.addEventListener('resize', () => {
      this.adjustCarouselAnimation();
    });
  }

  adjustCarouselAnimation(): void {
    const scrollContainer = document.querySelector(
      '.auto-scroll'
    ) as HTMLElement;

    if (!scrollContainer) return;

    const cards = scrollContainer.querySelectorAll('.work-areas-card');
    if (!cards.length) return;

    const cardWidth = cards[0].clientWidth;
    const gap = 20;

    const scrollDistance = -(cardWidth + gap) * (cards.length / 2);
    document.documentElement.style.setProperty(
      '--scroll-distance',
      `${scrollDistance}px`
    );

    const styleSheet = document.styleSheets[0];
    let keyframesRule: CSSKeyframesRule | null = null;

    for (const rule of styleSheet.cssRules) {
      if (
        rule.type === CSSRule.KEYFRAMES_RULE &&
        (rule as CSSKeyframesRule).name === 'autoScroll'
      ) {
        keyframesRule = rule as CSSKeyframesRule;
        break;
      }
    }

    if (keyframesRule) {
      keyframesRule.deleteRule('100%');
      keyframesRule.appendRule(
        `100% { transform: translateX(${scrollDistance}px); }`
      );
    } else {
      const animationText = `
        @keyframes autoScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(${scrollDistance}px); }
        }
      `;
      styleSheet.insertRule(animationText, styleSheet.cssRules.length);
    }
  }
}
