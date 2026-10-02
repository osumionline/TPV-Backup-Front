import InstallationInterface from '@model/installation.interface';

export default interface GetInstallationsResponseInterface {
  status: string;
  list: InstallationInterface[];
}
