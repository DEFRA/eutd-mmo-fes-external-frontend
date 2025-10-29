# This assumes that the parent image has been built locally using production and development build configuration as defra-node
# and defra-node-development tagged with a version.
ARG DEFRA_BASE_IMAGE_TAG=latest-22
FROM defradigital/node-development:$DEFRA_BASE_IMAGE_TAG as base

# We have production dependencies requiring node-gyp builds which don't
#   install cleanly with the defradigital/node image. So we'll install them here
#   and set NODE_ENV to production before copying them to the production image.
ENV NODE_ENV production
# Set the port that is going to be exposed later on in the Dockerfile as well.
ARG PORT=3000
ENV PORT=${PORT}

ARG GIT_HASH=""
RUN mkdir /app
COPY --chown=node:node . /app

# Create a build for running tests
FROM cypress/base:22.13.1 as test
# Update the package list and install curl
RUN apt-get update && apt-get install -y curl
COPY --chown=node:node . /app
WORKDIR /app
USER node
RUN npm ci --production=false
CMD ["npm", "run", ":test:start"]
HEALTHCHECK --interval=10s --start-period=60s \
    CMD curl --fail http://localhost:3000/ || exit 1

# Production stage exposes service port, copies in app code, creates a production build, and declares the Node app as the default command
FROM defradigital/node:$DEFRA_BASE_IMAGE_TAG as production
COPY --chown=node:node . /app
WORKDIR /app
USER node
RUN npm ci --production=false
RUN npm run build
RUN echo $GIT_HASH > githash

# Expose the PORT passed in at the start of the file
EXPOSE ${PORT}

#The base node image sets a very verbose log level, we're just going to warn
ENV NPM_CONFIG_LOGLEVEL=info

# This is the command that is run for the production service. The parent image has an ENTRYPOINT that uses a lightweight
#   init program "tini" that handles signals. As long as we don't override the ENTRYPOINT the "tini" routine will handle signals and
#   orphaned processes
#CMD ["node", "build/index.js"]
CMD ["npm", "run", "start"]
