import { Meteor } from 'meteor/meteor';
import { MongoInternals } from 'meteor/mongo';
import { Tenants, Times, Statuses, Clients, Projects, TaskGroups } from '/src/shared/collections/collections';

const { client: mongoClient } = MongoInternals.defaultRemoteCollectionDriver().mongo;

const removeTenantData = async tenantId => {
  const session = mongoClient.startSession();
  session.startTransaction();

  try {
    await Times.rawCollection().remove({ tenantId }, { session });
    await Statuses.rawCollection().remove({ tenantId }, { session });
    await Clients.rawCollection().remove({ tenantId }, { session });
    await Projects.rawCollection().remove({ tenantId }, { session });
    await TaskGroups.rawCollection().remove({ tenantId }, { session });
    await Tenants.rawCollection().remove({ _id: tenantId }, { session });
    await Meteor.users.rawCollection().remove({ tenantId }, { session });

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Transaction error occurred terminating organization', error);

    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

export default removeTenantData;
