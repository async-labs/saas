export class Invitation {
  _id: string;
  teamId: String;
  email: String;
  createdAt: Date;

  constructor(params) {
    Object.assign(this, params);
  }
}
