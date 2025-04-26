import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class JQueryService {
  constructor() {
    // Initialize jQuery if needed
  }

  /**
   * Returns the jQuery object or performs jQuery selector
   * @param selector Optional CSS selector
   */
  $(selector?: string): any {
    return selector ? $(selector) : $;
  }

  /**
   * Initialize a jQuery plugin on the specified element
   * @param selector CSS selector or jQuery element
   * @param plugin Plugin name
   * @param options Plugin options
   */
  initPlugin(selector: any, plugin: string, options: any = {}): any {
    return $(selector)[plugin](options);
  }

  // Additional jQuery helper methods
  fadeIn(selector: string, duration: number = 400): void {
    $(selector).fadeIn(duration);
  }

  fadeOut(selector: string, duration: number = 400): void {
    $(selector).fadeOut(duration);
  }
}
