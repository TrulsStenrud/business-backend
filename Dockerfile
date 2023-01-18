FROM azul/zulu-openjdk-alpine:17-jre@sha256:d276666c51a51892ba662feaa5de6e869319109c77b19c58098bd1fd9c22f70f

RUN set -eux; \
    adduser -S app; \
    mkdir /app; \
    chown app /app

EXPOSE 8080

USER app
WORKDIR /app

CMD ["java", "-Dlogback.configurationFile=logback-container.xml", "-jar", "app.jar"]

COPY target/app.jar /app
