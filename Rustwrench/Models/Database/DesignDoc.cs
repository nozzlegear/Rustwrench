using System.Collections.Generic;
using Newtonsoft.Json;

namespace Rustwrench.Models.Database
{
    /// <summary>
    /// Represents a CouchDB design doc.
    /// </summary>
    public class DesignDoc
    {
        public string _id { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string _rev { get; set; }

        public string language { get; } = "javascript";
        
        public int version { get; set; }

        public Dictionary<string, DesignDocView> views { get; set; }
    }
}