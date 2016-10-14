using System;
using System.Collections.Generic;

namespace Rustwrench.Interfaces
{
    /// <summary>
    /// An interface to be shared by the <see cref="Rustwrench.Models.User"/> and <see cref="Rustwrench.Models.SessionToken"/> classes. This interface
    /// contains user properties that should be shared between both classes.
    /// </summary>
    public interface IUser
    {
        string UserId { get; }

        string ShopifyUrl { get; }
        
        string ShopifyAccessToken { get; }

        string ShopName { get; }

        long? ShopId { get; }

        long? ShopifyChargeId { get; }

        DateTime DateCreated { get; }

        List<string> Permissions { get; }
    }    
}
