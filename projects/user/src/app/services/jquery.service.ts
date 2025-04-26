import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class JQueryService {
  constructor() { }

  /**
   * Returns the jQuery object
   */
  get $(): any {
    return $;
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
}
