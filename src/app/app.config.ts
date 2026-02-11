import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { StorageOption, withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { provideStore } from '@ngxs/store';

import { routes } from './app.routes';
import { ServiceBookState } from './state/service-book.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideStore(
      [ServiceBookState],
      withNgxsReduxDevtoolsPlugin(),
      withNgxsStoragePlugin({
        keys: [
          'serviceBook.activeUserId',
          'serviceBook.selectedVehicleId',
          'serviceBook.users',
          'serviceBook.vehicles',
          'serviceBook.records'
        ],
        storage: StorageOption.SessionStorage
      })
    )
  ]
};
