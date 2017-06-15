import { MapComponentPage } from './app.po';

describe('map-component App', () => {
  let page: MapComponentPage;

  beforeEach(() => {
    page = new MapComponentPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
