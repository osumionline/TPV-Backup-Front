import InstallationInterface from '@model/installations/installation.interface';

export default interface GetInstallationsResponseInterface {
  status: string;
  list: InstallationInterface[];
}
