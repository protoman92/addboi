variable "user_cache_provisioned_capacity" {
  type = number
}

variable "stage" {
  type = string
}

locals {
  region  = "ap-southeast-1"
  service = "addboi"
}
