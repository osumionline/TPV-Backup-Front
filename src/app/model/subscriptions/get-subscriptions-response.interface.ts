import SubscriptionInterface from '@model/subscriptions/subscription.interface';

export default interface GetSubscriptionsResponseInterface {
  status: string;
  list: SubscriptionInterface[];
}
