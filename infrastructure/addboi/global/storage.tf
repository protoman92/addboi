module "asset" {
  source  = "cloudposse/cloudfront-s3-cdn/aws"
  version = "0.34.0"
  additional_bucket_policy = jsonencode(
    {
      Version = "2012-10-17"
      Statement = [
        {
          Effect = "Allow"
          Principal = {
            AWS = ["arn:aws:iam::${var.account_id}:root"]
          }
          Action = [
            "s3:PutObject"
          ]
          Resource = [
            "arn:aws:s3:::$${bucket_name}",
            "arn:aws:s3:::$${bucket_name}/*"
          ]
        }
      ]
    }
  )
  logging_enabled        = false
  name                   = "asset"
  namespace              = local.service
  stage                  = local.stage
  viewer_protocol_policy = "redirect-to-https"
  website_enabled        = true

  tags = {
    service = local.service
    stage   = local.stage
  }
}
