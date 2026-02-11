import { State, Action, Selector, StateContext } from '@ngxs/store';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  nickname: string;
  sharedWith: string[];
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  title: string;
  date: string;
  odometer: number;
  cost: number;
  notes: string;
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface ServiceBookStateModel {
  title: string;
  users: User[];
  vehicles: Vehicle[];
  records: ServiceRecord[];
  activeUserId: string | null;
  selectedVehicleId: string | null;
  authMessage: string;
  vehicleMessage: string;
  shareMessage: string;
  recordMessage: string;
  notifications: NotificationMessage[];
}

export class Login {
  static readonly type = '[Auth] Login';
  constructor(
    public readonly email: string,
    public readonly password: string
  ) {}
}

export class Register {
  static readonly type = '[Auth] Register';
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string
  ) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class SelectVehicle {
  static readonly type = '[Vehicle] Select';
  constructor(public readonly vehicleId: string) {}
}

export class AddVehicle {
  static readonly type = '[Vehicle] Add';
  constructor(
    public readonly payload: {
      nickname: string;
      make: string;
      model: string;
      year: number;
      vin: string;
    }
  ) {}
}

export class AddRecord {
  static readonly type = '[Record] Add';
  constructor(
    public readonly payload: {
      title: string;
      date: string;
      odometer: number;
      cost: number;
      notes: string;
    }
  ) {}
}

export class RemoveRecord {
  static readonly type = '[Record] Remove';
  constructor(public readonly recordId: string) {}
}

export class ShareVehicle {
  static readonly type = '[Share] Add';
  constructor(public readonly email: string) {}
}

export class RemoveShare {
  static readonly type = '[Share] Remove';
  constructor(public readonly userId: string) {}
}

export class RemoveVehicle {
  static readonly type = '[Vehicle] Remove';
  constructor(public readonly vehicleId: string) {}
}

export class AddNotification {
  static readonly type = '[Notifications] Add';
  constructor(
    public readonly message: string,
    public readonly notificationType: NotificationMessage['type']
  ) {}
}

export class RemoveNotification {
  static readonly type = '[Notifications] Remove';
  constructor(public readonly id: string) {}
}

@State<ServiceBookStateModel>({
  name: 'serviceBook',
  defaults: {
    title: $localize`:@@appTitle:Szervizkönyv`,
    users: [],
    vehicles: [],
    records: [],
    activeUserId: null,
    selectedVehicleId: null,
    authMessage: '',
    vehicleMessage: '',
    shareMessage: '',
    recordMessage: '',
    notifications: []
  }
})
export class ServiceBookState {
  @Selector()
  static title(state: ServiceBookStateModel): string {
    return state.title;
  }

  @Selector()
  static activeUserId(state: ServiceBookStateModel): string | null {
    return state.activeUserId;
  }

  @Selector()
  static selectedVehicleId(state: ServiceBookStateModel): string | null {
    return state.selectedVehicleId;
  }

  @Selector()
  static authMessage(state: ServiceBookStateModel): string {
    return state.authMessage;
  }

  @Selector()
  static vehicleMessage(state: ServiceBookStateModel): string {
    return state.vehicleMessage;
  }

  @Selector()
  static shareMessage(state: ServiceBookStateModel): string {
    return state.shareMessage;
  }

  @Selector()
  static recordMessage(state: ServiceBookStateModel): string {
    return state.recordMessage;
  }

  @Selector()
  static notifications(state: ServiceBookStateModel): NotificationMessage[] {
    return state.notifications;
  }

  @Selector()
  static currentUser(state: ServiceBookStateModel): User | null {
    return state.users.find((user) => user.id === state.activeUserId) ?? null;
  }

  @Selector()
  static accessibleVehicles(state: ServiceBookStateModel): Vehicle[] {
    const userId = state.activeUserId;
    if (!userId) {
      return [];
    }

    return state.vehicles.filter(
      (vehicle) => vehicle.ownerId === userId || vehicle.sharedWith.includes(userId)
    );
  }

  @Selector()
  static selectedVehicle(state: ServiceBookStateModel): Vehicle | null {
    const vehicles = ServiceBookState.accessibleVehicles(state);
    return vehicles.find((vehicle) => vehicle.id === state.selectedVehicleId) ?? null;
  }

  @Selector()
  static selectedRecords(state: ServiceBookStateModel): ServiceRecord[] {
    if (!state.selectedVehicleId) {
      return [];
    }

    return state.records
      .filter((record) => record.vehicleId === state.selectedVehicleId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  @Selector()
  static selectedRecordsTotalCost(state: ServiceBookStateModel): number {
    if (!state.selectedVehicleId) {
      return 0;
    }

    return state.records
      .filter((record) => record.vehicleId === state.selectedVehicleId)
      .reduce((total, record) => total + record.cost, 0);
  }

  @Selector()
  static sharedUsers(state: ServiceBookStateModel): User[] {
    const selected = ServiceBookState.selectedVehicle(state);
    if (!selected) {
      return [];
    }

    return state.users.filter((user) => selected.sharedWith.includes(user.id));
  }

  @Selector()
  static canShareSelected(state: ServiceBookStateModel): boolean {
    const currentUser = ServiceBookState.currentUser(state);
    const selected = ServiceBookState.selectedVehicle(state);
    if (!currentUser || !selected) {
      return false;
    }

    return selected.ownerId === currentUser.id;
  }

  @Selector()
  static selectedOwnerName(state: ServiceBookStateModel): string {
    const selected = ServiceBookState.selectedVehicle(state);
    if (!selected) {
      return '';
    }

    return (
      state.users.find((user) => user.id === selected.ownerId)?.name ??
      'Ismeretlen felhasználó'
    );
  }

  @Action(Login)
  login(ctx: StateContext<ServiceBookStateModel>, action: Login): void {
    const state = ctx.getState();
    const match = state.users.find(
      (user) => user.email === action.email.trim() && user.password === action.password
    );

    if (!match) {
      ctx.patchState({
        authMessage: $localize`:@@authInvalidEmail:Hibás email vagy jelszó.`
      });
      appendNotification(
        ctx,
        $localize`:@@toastLoginFailed:Hibás email vagy jelszó.`,
        'error'
      );
      return;
    }

    const accessible = state.vehicles.filter(
      (vehicle) => vehicle.ownerId === match.id || vehicle.sharedWith.includes(match.id)
    );

    ctx.patchState({
      activeUserId: match.id,
      selectedVehicleId: accessible[0]?.id ?? null,
      authMessage: ''
    });
    appendNotification(
      ctx,
      $localize`:@@toastLoginSuccess:Sikeres bejelentkezés.`,
      'success'
    );
  }

  @Action(Register)
  register(ctx: StateContext<ServiceBookStateModel>, action: Register): void {
    const state = ctx.getState();
    const trimmedEmail = action.email.trim();
    const trimmedName = action.name.trim();

    if (!trimmedEmail || !trimmedName || !action.password) {
      ctx.patchState({
        authMessage: $localize`:@@authMissingFields:Töltsön ki minden regisztrációs mezőt.`
      });
      appendNotification(
        ctx,
        $localize`:@@toastRegisterMissing:Töltse ki minden regisztrációs mezőt.`,
        'error'
      );
      return;
    }

    if (state.users.some((user) => user.email === trimmedEmail)) {
      ctx.patchState({
        authMessage: $localize`:@@authEmailExists:Ez az email már regisztrálva van.`
      });
      appendNotification(
        ctx,
        $localize`:@@toastRegisterExists:Ez az email már regisztrálva van.`,
        'error'
      );
      return;
    }

    const newUser: User = {
      id: createId('user'),
      name: trimmedName,
      email: trimmedEmail,
      password: action.password
    };

    ctx.patchState({
      users: [...state.users, newUser],
      activeUserId: newUser.id,
      selectedVehicleId: null,
      authMessage: ''
    });
    appendNotification(
      ctx,
      $localize`:@@toastRegisterSuccess:Fiók létrehozva.`,
      'success'
    );
  }

  @Action(Logout)
  logout(ctx: StateContext<ServiceBookStateModel>): void {
    ctx.patchState({
      activeUserId: null,
      selectedVehicleId: null,
      authMessage: '',
      vehicleMessage: '',
      shareMessage: '',
      recordMessage: ''
    });
    appendNotification(
      ctx,
      $localize`:@@toastLogoutSuccess:Sikeres kijelentkezés.`,
      'success'
    );
  }

  @Action(SelectVehicle)
  selectVehicle(ctx: StateContext<ServiceBookStateModel>, action: SelectVehicle): void {
    ctx.patchState({
      selectedVehicleId: action.vehicleId,
      shareMessage: '',
      recordMessage: ''
    });
  }

  @Action(AddVehicle)
  addVehicle(ctx: StateContext<ServiceBookStateModel>, action: AddVehicle): void {
    const state = ctx.getState();
    const userId = state.activeUserId;
    if (!userId) {
      return;
    }

    if (!action.payload.make || !action.payload.model || !action.payload.vin) {
      ctx.patchState({
        vehicleMessage: $localize`:@@vehicleRequired:A márka, a modell és az alvázszám kötelező.`
      });
      appendNotification(
        ctx,
        $localize`:@@toastVehicleRequired:A márka, a modell és az alvázszám kötelező.`,
        'error'
      );
      return;
    }

    const vehicle: Vehicle = {
      id: createId('vehicle'),
      ownerId: userId,
      make: action.payload.make.trim(),
      model: action.payload.model.trim(),
      year: Number(action.payload.year),
      vin: action.payload.vin.trim(),
      nickname:
        action.payload.nickname.trim() || `${action.payload.make} ${action.payload.model}`,
      sharedWith: []
    };

    ctx.patchState({
      vehicles: [vehicle, ...state.vehicles],
      selectedVehicleId: vehicle.id,
      vehicleMessage: ''
    });
    appendNotification(
      ctx,
      $localize`:@@toastVehicleAdded:Jármű hozzáadva.`,
      'success'
    );
  }

  @Action(AddRecord)
  addRecord(ctx: StateContext<ServiceBookStateModel>, action: AddRecord): void {
    const state = ctx.getState();
    if (!state.selectedVehicleId) {
      return;
    }

    if (!action.payload.title || !action.payload.date) {
      ctx.patchState({
        recordMessage: $localize`:@@recordRequired:A megnevezés és a dátum kötelező.`
      });
      appendNotification(
        ctx,
        $localize`:@@toastRecordRequired:A megnevezés és a dátum kötelező.`,
        'error'
      );
      return;
    }

    const record: ServiceRecord = {
      id: createId('record'),
      vehicleId: state.selectedVehicleId,
      title: action.payload.title.trim(),
      date: action.payload.date,
      odometer: Number(action.payload.odometer),
      cost: Number(action.payload.cost),
      notes: action.payload.notes.trim()
    };

    ctx.patchState({
      records: [record, ...state.records],
      recordMessage: ''
    });
    appendNotification(
      ctx,
      $localize`:@@toastRecordAdded:Szervizbejegyzés hozzáadva.`,
      'success'
    );
  }

  @Action(RemoveRecord)
  removeRecord(ctx: StateContext<ServiceBookStateModel>, action: RemoveRecord): void {
    const state = ctx.getState();
    ctx.patchState({
      records: state.records.filter((record) => record.id !== action.recordId)
    });
    appendNotification(
      ctx,
      $localize`:@@toastRecordRemoved:Szervizbejegyzés törölve.`,
      'success'
    );
  }

  @Action(ShareVehicle)
  shareVehicle(ctx: StateContext<ServiceBookStateModel>, action: ShareVehicle): void {
    const state = ctx.getState();
    const selected = ServiceBookState.selectedVehicle(state);
    const currentUser = ServiceBookState.currentUser(state);

    if (!selected || !currentUser || selected.ownerId !== currentUser.id) {
      return;
    }

    const trimmedEmail = action.email.trim();
    const userToShare = state.users.find((user) => user.email === trimmedEmail);

    if (!trimmedEmail) {
      ctx.patchState({
        shareMessage: $localize`:@@shareMissingEmail:Adjon meg egy email címet a megosztáshoz.`
      });
      appendNotification(
        ctx,
        $localize`:@@toastShareMissing:Adjon meg egy email címet a megosztáshoz.`,
        'error'
      );
      return;
    }

    if (!userToShare) {
      ctx.patchState({
        shareMessage: $localize`:@@shareUserMissing:Az adott email címmel nem található felhasználó.`
      });
      appendNotification(
        ctx,
        $localize`:@@toastShareMissingUser:Az adott email címmel nem található felhasználó.`,
        'error'
      );
      return;
    }

    if (userToShare.id === selected.ownerId) {
      ctx.patchState({
        shareMessage: $localize`:@@shareOwnerAlready:Tulajdonos már rendelkezik hozzáféréssel.`
      });
      appendNotification(
        ctx,
        $localize`:@@toastShareOwner:Tulajdonos már rendelkezik hozzáféréssel.`,
        'error'
      );
      return;
    }

    if (selected.sharedWith.includes(userToShare.id)) {
      ctx.patchState({
        shareMessage: $localize`:@@shareAlready:Ez a felhasználó már hozzáfér.`
      });
      appendNotification(
        ctx,
        $localize`:@@toastShareAlready:Ez a felhasználó már hozzáfér.`,
        'error'
      );
      return;
    }

    ctx.patchState({
      vehicles: state.vehicles.map((item) =>
        item.id === selected.id
          ? { ...item, sharedWith: [...item.sharedWith, userToShare.id] }
          : item
      ),
      shareMessage: ''
    });
    appendNotification(ctx, $localize`:@@toastShareSuccess:Megosztás létrehozva.`, 'success');
  }

  @Action(RemoveShare)
  removeShare(ctx: StateContext<ServiceBookStateModel>, action: RemoveShare): void {
    const state = ctx.getState();
    const selected = ServiceBookState.selectedVehicle(state);
    const currentUser = ServiceBookState.currentUser(state);

    if (!selected || !currentUser || selected.ownerId !== currentUser.id) {
      return;
    }

    ctx.patchState({
      vehicles: state.vehicles.map((item) =>
        item.id === selected.id
          ? { ...item, sharedWith: item.sharedWith.filter((id) => id !== action.userId) }
          : item
      )
    });
    appendNotification(
      ctx,
      $localize`:@@toastShareRemoved:Megosztás eltávolítva.`,
      'success'
    );
  }

  @Action(RemoveVehicle)
  removeVehicle(ctx: StateContext<ServiceBookStateModel>, action: RemoveVehicle): void {
    const state = ctx.getState();
    const currentUser = ServiceBookState.currentUser(state);
    const vehicle = state.vehicles.find((item) => item.id === action.vehicleId);

    if (!currentUser || !vehicle || vehicle.ownerId !== currentUser.id) {
      return;
    }

    const remainingVehicles = state.vehicles.filter((item) => item.id !== action.vehicleId);
    const remainingRecords = state.records.filter((record) => record.vehicleId !== action.vehicleId);
    const selectedVehicleId =
      state.selectedVehicleId === action.vehicleId
        ? remainingVehicles.find(
            (item) =>
              item.ownerId === currentUser.id || item.sharedWith.includes(currentUser.id)
          )?.id ?? null
        : state.selectedVehicleId;

    ctx.patchState({
      vehicles: remainingVehicles,
      records: remainingRecords,
      selectedVehicleId,
      shareMessage: '',
      recordMessage: ''
    });
    appendNotification(ctx, $localize`:@@toastVehicleRemoved:Jármű törölve.`, 'success');
  }

  @Action(AddNotification)
  addNotification(ctx: StateContext<ServiceBookStateModel>, action: AddNotification): void {
    const state = ctx.getState();
    const notification: NotificationMessage = {
      id: createId('toast'),
      type: action.notificationType,
      message: action.message
    };

    ctx.patchState({
      notifications: [...state.notifications, notification]
    });
  }

  @Action(RemoveNotification)
  removeNotification(ctx: StateContext<ServiceBookStateModel>, action: RemoveNotification): void {
    const state = ctx.getState();
    ctx.patchState({
      notifications: state.notifications.filter((item) => item.id !== action.id)
    });
  }
}

function appendNotification(
  ctx: StateContext<ServiceBookStateModel>,
  message: string,
  type: NotificationMessage['type']
): void {
  const state = ctx.getState();
  const notification: NotificationMessage = {
    id: createId('toast'),
    type,
    message
  };

  ctx.patchState({
    notifications: [...state.notifications, notification]
  });
}

function createId(prefix: string): string {
  const random = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`;
}
