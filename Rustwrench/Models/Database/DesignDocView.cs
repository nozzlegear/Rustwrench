namespace Rustwrench.Models.Database
{
    public class DesignDocView
    {
        /// <summary>
        /// The view's map function.
        /// </summary>
        public string map { get; set; }

        /// <summary>
        /// The view's reduce function.
        /// </summary>
        public string reduce { get; set; }
    }
}