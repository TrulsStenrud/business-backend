package no.gutta

import io.ktor.server.application.Application
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import no.gutta.plugins.configureHTTP
import no.gutta.plugins.configureRouting
import no.gutta.plugins.configureSerialization

fun main() {
  embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module)
    .start(wait = true)
}
fun Application.module() {
//  configureSecurity()
  configureHTTP()
  configureSerialization()
  configureRouting()
}
