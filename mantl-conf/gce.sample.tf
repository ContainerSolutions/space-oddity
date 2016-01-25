variable control_count { default = 1 }
variable worker_count { default = 3 }
variable edge_count { default = 1 }
variable short_name { default = "mi" }
variable domain { default = "container-solutions.com"}
variable subdomain { default = ".drone"}


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
  region = "europe-west1"
  zone = "europe-west1-b"
  control_count = "${var.control_count}"
  worker_count = "${var.worker_count}"
  edge_count = "${var.edge_count}"
}

module "dns" {
  source = "./terraform/gce"

  control_count = "${var.control_count}"
  control_ips = "${module.gce-dns.control_ips}"
  domain = "${var.domain}"
  edge_count = "${var.edge_count}"
  edge_ips = "${module.gce-dns.edge_ips}"
  short_name = "${var.short_name}"
  subdomain = "${var.subdomain}"
  worker_count = "${var.worker_count}"
  worker_ips = "${module.gce-dns.worker_ips}"
}

resource "google_dns_managed_zone" "managed-zone" {
  name = "drone"
  dns_name = "drone.container-solutions.com"
  description "Managed zone for drone.container-solutions.com"
}
