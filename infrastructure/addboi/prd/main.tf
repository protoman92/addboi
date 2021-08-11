provider "aws" {
  region = "ap-southeast-1"
}

provider "aws" {
  alias  = "ap-southeast-1"
  region = "ap-southeast-1"
}

provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}

module "this" {
  source                          = "../modules"
  stage                           = "production"
  user_cache_provisioned_capacity = 5
  providers = {
    aws = aws.ap-southeast-1
  }
}

terraform {
  backend "s3" {
    bucket = "addboi-global-state"
    key    = "terraform-addboi-prd.tfstate"
    region = "ap-southeast-1"
  }
}
