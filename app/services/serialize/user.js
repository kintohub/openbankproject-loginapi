export default {
  sparse ({ item, idx }) {
      return {
          id:             item.id || item._id,
          firstName:      item.firstName,
          lastName:       item.lastName,
          email:          item.email,
          createdAt:      item.created_at,
          isVerified:     item.isVerified,
          isBanned:       item.isBanned,
          role:           item.role,
          currency:       item.currency,
      };
    },
    full ({ item, idx }) {

        return {
            id:                 item.id || item._id,
            firstName:          item.firstName,
            lastName:           item.lastName,
            email:              item.email,
            createdAt:          item.created_at,
            isVerified:         item.isVerified,
            isBanned:           item.isBanned,
            role:               item.role,
            currency:           item.currency,
            orders:             item.orders,
        };
    },
}