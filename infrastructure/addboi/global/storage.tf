module "asset" {
  source  = "cloudposse/cloudfront-s3-cdn/aws"
  version = "0.34.0"
  additional_bucket_policy = jsonencode(
    {
      Version = "2012-10-17"
      Statement = [
        {
          Action = [
            "s3:GetObject",
            "s3:PutObject"
          ]
          Effect = "Allow"
          Principal = {
            AWS = [
              "arn:aws:iam::${var.account_id}:root",
              data.aws_iam_role.chatbot_production_iam_role.arn
            ]
          }
          Resource = [
            "arn:aws:s3:::$${bucket_name}",
            "arn:aws:s3:::$${bucket_name}/*"
          ]
          Sid = "AssetPolicy"
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
