module.exports = {
  siteMetadata: {
    title: `Synesthesia Project`
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-force-trailing-slashes`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `api`,
        path: `${__dirname}/content/api`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/pages`,
        name: `pages`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
        ],
      },
    },
    {
      resolve: `gatsby-transformer-typedoc`,
      options: {
        source: 'api',
        basePath: 'api/'
      }
    }
  ],
}
