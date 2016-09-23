using System.Collections.Generic;
using System.Linq;
using MyCouch.Responses;

namespace Rustwrench.Models.Database
{
    public class QueryResult<T>
    {
        public QueryResult(ViewQueryResponse<T, T> result)
        {
            TotalRows = result.TotalRows;
            Offset = result.OffSet;
            Rows = result.Rows.Select(r => r.IncludedDoc);
        }

        public IEnumerable<T> Rows { get; set; }

        public long TotalRows { get; set; }

        public long Offset { get; set; }
    }
}