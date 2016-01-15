provider "google" {
  project = "container-solutions-workshops"
  region = "europe-west1"
  credentials = "${file("account.json")}"
  account_file = "${file("account.json")}"
}

module "gce-dc" {
  source = "./terraform/gce"
  datacenter = "gce-dc"
  control_type = "n1-standard-1"
  worker_type = "n1-standard-2"
  network_ipv4 = "10.0.0.0/16"
  long_name = "microservices-infrastructure"
  short_name = "mi"
  domain = "container-solutions.com"
  subdomain = ".drone"
  region = "europe-west1"
  zone = "europe-west1-b"
  control_count = 1
  worker_count = 3
  edge_count = 1
}

resource "google_dns_managed_zone" "managed-zone" {
  name = "drone"
  dns_name = "drone.container-solutions.com"
  description "Managed zone for drone.container-solutions.com"
}
