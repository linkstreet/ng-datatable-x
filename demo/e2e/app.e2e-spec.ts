import { NgDatatableXPage } from './app.po';

describe('ng-datatable-x App', () => {
  let page: NgDatatableXPage;

  beforeEach(() => {
    page = new NgDatatableXPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
