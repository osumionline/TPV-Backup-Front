import SubscriptionInterface from '@model/subscription.interface';

export default interface GetSubscriptionsResponseInterface {
  status: string;
  list: SubscriptionInterface[];
}
